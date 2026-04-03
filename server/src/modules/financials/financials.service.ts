import { prisma } from '../../config/database';
import { CHART_OF_ACCOUNTS, classifyTransaction, BSSection } from './chart-of-accounts';
import ExcelJS from 'exceljs';

export interface BSRow {
    section: string;
    subSection: string;
    account: string;
    balance: number;
    isSubtotal?: boolean;
    isTotal?: boolean;
}

export interface BalanceSheetResult {
    rows: BSRow[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    balanced: boolean; // A = L + E
    asOfDate: string;
}

export class FinancialsService {
    async getPnL(userId: string, organizationId?: string, startDate?: string, endDate?: string) {
        const where: any = organizationId ? { organizationId } : { userId };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const transactions = await prisma.transaction.findMany({ where });

        let totalIncome = 0;
        let totalExpense = 0;
        let cogs = 0;
        const breakdown: Record<string, number> = {};
        
        // Specific categories mapping for requested charts
        const categorizedExpenses = {
            'Salaries': 0,
            'Marketing': 0,
            'Operations': 0,
            'Tools/SaaS': 0,
            'Other': 0
        };

        const COGS_KEYWORDS = ['inventory', 'cogs', 'cost of goods sold', 'raw materials', 'materials', 'direct labor'];

        // Dictionary for chronological charting: Map<"YYYY-MM", ...> (Better for sorting)
        const monthlyDataMap = new Map<string, { yearMonth: string, name: string; Income: number; Expenses: number; Profit: number }>();

        const sortedTx = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

        sortedTx.forEach((tx) => {
            const catLower = tx.category.toLowerCase();
            
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') {
                totalExpense += tx.amount;
                breakdown[tx.category] = (breakdown[tx.category] || 0) + tx.amount;

                // Identify COGS
                if (COGS_KEYWORDS.some(k => catLower.includes(k))) {
                    cogs += tx.amount;
                }

                // Categorize for requested charts
                if (catLower.includes('salary') || catLower.includes('payroll') || catLower.includes('wage')) {
                    categorizedExpenses['Salaries'] += tx.amount;
                } else if (catLower.includes('marketing') || catLower.includes('ad ') || catLower.includes('ads') || catLower.includes('promotion')) {
                    categorizedExpenses['Marketing'] += tx.amount;
                } else if (catLower.includes('operation') || catLower.includes('rent') || catLower.includes('utilities') || catLower.includes('office') || catLower.includes('maintenance')) {
                    categorizedExpenses['Operations'] += tx.amount;
                } else if (catLower.includes('software') || catLower.includes('saas') || catLower.includes('tool') || catLower.includes('license') || catLower.includes('subscription')) {
                    categorizedExpenses['Tools/SaaS'] += tx.amount;
                } else {
                    categorizedExpenses['Other'] += tx.amount;
                }
            }

            // Group for the Trend Chart
            const monthYearName = tx.date.toLocaleString('default', { month: 'short', year: 'numeric' });
            // Format YYYY-MM for sorting
            const yearMonthStr = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyDataMap.has(yearMonthStr)) {
                monthlyDataMap.set(yearMonthStr, { yearMonth: yearMonthStr, name: monthYearName, Income: 0, Expenses: 0, Profit: 0 });
            }
            const monthGroup = monthlyDataMap.get(yearMonthStr)!;
            if (tx.type === 'INCOME') {
                monthGroup.Income += tx.amount;
            } else if (tx.type === 'EXPENSE') {
                monthGroup.Expenses += tx.amount;
            }
            monthGroup.Profit = monthGroup.Income - monthGroup.Expenses;
        });

        // Compute Growth Metrics (MoM)
        let revenueGrowth = 0, expenseGrowth = 0, profitGrowth = 0;
        const sortedMonths = Array.from(monthlyDataMap.values()).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
        if (sortedMonths.length >= 2) {
            const currentMonth = sortedMonths[sortedMonths.length - 1];
            const previousMonth = sortedMonths[sortedMonths.length - 2];

            revenueGrowth = previousMonth.Income === 0 ? 100 : ((currentMonth.Income - previousMonth.Income) / previousMonth.Income) * 100;
            expenseGrowth = previousMonth.Expenses === 0 ? 100 : ((currentMonth.Expenses - previousMonth.Expenses) / previousMonth.Expenses) * 100;
            profitGrowth = previousMonth.Profit === 0 ? 100 : ((currentMonth.Profit - previousMonth.Profit) / Math.abs(previousMonth.Profit)) * 100;
        }

        const monthlyTrend = sortedMonths.map(item => ({ name: item.name, Income: item.Income, Expenses: item.Expenses, Profit: item.Profit }));

        // Margins
        const grossProfit = totalIncome - cogs;
        const opex = totalExpense - cogs;
        const operatingProfit = grossProfit - opex; // simplified
        const netProfit = totalIncome - totalExpense;

        const grossProfitMargin = totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0;
        const operatingMargin = totalIncome > 0 ? (operatingProfit / totalIncome) * 100 : 0;
        const netProfitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Burn Rate & Runway
        // Average monthly expenses over the available months (up to 12)
        const monthsCount = sortedMonths.length > 0 ? sortedMonths.length : 1;
        const monthlyBurnRate = totalExpense / monthsCount;

        // Get cash balance for Runway
        const balanceSheet = await this.getBalanceSheet(userId, organizationId, endDate);
        const cashRow = balanceSheet.rows.find(r => r.account === 'Cash & Cash Equivalents');
        const cashBalance = cashRow ? cashRow.balance : 0;
        const runwayMonths = monthlyBurnRate > 0 ? cashBalance / monthlyBurnRate : 0;

        // Planned vs Actual (Mocked since we don't have Budget data in DB yet)
        const plannedVsActualData = [
            { category: 'Salaries', actual: categorizedExpenses['Salaries'], planned: categorizedExpenses['Salaries'] * 1.1 },
            { category: 'Marketing', actual: categorizedExpenses['Marketing'], planned: categorizedExpenses['Marketing'] * 0.8 },
            { category: 'Operations', actual: categorizedExpenses['Operations'], planned: categorizedExpenses['Operations'] * 0.95 },
            { category: 'Tools/SaaS', actual: categorizedExpenses['Tools/SaaS'], planned: categorizedExpenses['Tools/SaaS'] * 1.05 }
        ].filter(d => d.actual > 0 || d.planned > 0);

        return {
            totalIncome,
            totalExpense,
            netProfit,
            transactionsCount: transactions.length,
            breakdown,
            categorizedExpenses, // requested pie chart categories
            monthlyTrend,
            margins: { grossProfitMargin, operatingMargin, netProfitMargin },
            growth: { revenueGrowth, expenseGrowth, profitGrowth },
            burnRate: monthlyBurnRate,
            runwayMonths,
            plannedVsActualData,
            missingDataFlags: { plannedBudget: true, cashBalance: cashBalance === 0 } // Used to show note
        };
    }

    /**
     * Dynamic, transaction-driven Balance Sheet.
     */
    async getBalanceSheet(userId: string, organizationId?: string, asOfDate?: string): Promise<BalanceSheetResult> {
        const dateLimit = asOfDate ? new Date(asOfDate) : new Date();
        // Set to end of day
        dateLimit.setHours(23, 59, 59, 999);

        const where: any = organizationId
            ? { organizationId, date: { lte: dateLimit } }
            : { userId, date: { lte: dateLimit } };

        const transactions = await prisma.transaction.findMany({ where });

        // ── Aggregate balances ──────────────────────────────────────
        // Initialize all accounts to 0
        const balances: Record<string, number> = {};
        for (const item of CHART_OF_ACCOUNTS) {
            balances[item.account] = 0;
        }

        let totalIncome = 0;
        let totalExpense = 0;

        for (const tx of transactions) {
            if (tx.type === 'INCOME') {
                totalIncome += tx.amount;
                // Income: map category to asset account (e.g. Accounts Receivable)
                const account = classifyTransaction(tx.category, 'INCOME');
                if (account === 'Cash & Cash Equivalents') {
                    // Direct cash income
                    balances['Cash & Cash Equivalents'] = (balances['Cash & Cash Equivalents'] || 0) + tx.amount;
                } else {
                    // Income mapped to a specific asset account (e.g. AR)
                    balances[account] = (balances[account] || 0) + tx.amount;
                }
            } else {
                // EXPENSE
                totalExpense += tx.amount;
                const account = classifyTransaction(tx.category, 'EXPENSE');

                if (account === 'Cash & Cash Equivalents') {
                    // Unmapped expense: reduces cash directly
                    balances['Cash & Cash Equivalents'] = (balances['Cash & Cash Equivalents'] || 0) - tx.amount;
                } else {
                    // Mapped expense: the target account (e.g. AP, Accrued) increases as a liability
                    // and cash decreases
                    const targetItem = CHART_OF_ACCOUNTS.find(i => i.account === account);
                    if (targetItem && targetItem.section === 'ASSETS') {
                        // Asset purchase: increase that asset, decrease cash
                        balances[account] = (balances[account] || 0) + tx.amount;
                        balances['Cash & Cash Equivalents'] = (balances['Cash & Cash Equivalents'] || 0) - tx.amount;
                    } else if (targetItem && targetItem.section === 'LIABILITIES') {
                        // Liability expense: increase liability (e.g. AP, Salaries Payable)
                        // In a simplified model we assume the expense is paid, so cash decreases
                        balances[account] = (balances[account] || 0) + tx.amount;
                        balances['Cash & Cash Equivalents'] = (balances['Cash & Cash Equivalents'] || 0) - tx.amount;
                    } else {
                        // Fallback
                        balances['Cash & Cash Equivalents'] = (balances['Cash & Cash Equivalents'] || 0) - tx.amount;
                    }
                }
            }
        }

        // Retained Earnings = cumulative net income
        const netIncome = totalIncome - totalExpense;
        balances['Retained Earnings'] = netIncome;

        // ── Build output rows ────────────────────────────────────────
        const rows: BSRow[] = [];
        const sections: BSSection[] = ['ASSETS', 'LIABILITIES', 'EQUITY'];

        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;

        for (const section of sections) {
            const sectionItems = CHART_OF_ACCOUNTS.filter(i => i.section === section);
            const subSections = [...new Set(sectionItems.map(i => i.subSection))];
            let sectionTotal = 0;

            for (const sub of subSections) {
                const subItems = sectionItems.filter(i => i.subSection === sub);
                let subTotal = 0;

                for (const item of subItems) {
                    const bal = balances[item.account] || 0;
                    subTotal += bal;
                    rows.push({
                        section,
                        subSection: sub,
                        account: item.account,
                        balance: Math.round(bal * 100) / 100,
                    });
                }

                rows.push({
                    section,
                    subSection: sub,
                    account: `Total ${sub}`,
                    balance: Math.round(subTotal * 100) / 100,
                    isSubtotal: true,
                });

                sectionTotal += subTotal;
            }

            rows.push({
                section,
                subSection: '',
                account: `TOTAL ${section}`,
                balance: Math.round(sectionTotal * 100) / 100,
                isTotal: true,
            });

            if (section === 'ASSETS') totalAssets = sectionTotal;
            if (section === 'LIABILITIES') totalLiabilities = sectionTotal;
            if (section === 'EQUITY') totalEquity = sectionTotal;
        }

        totalAssets = Math.round(totalAssets * 100) / 100;
        totalLiabilities = Math.round(totalLiabilities * 100) / 100;
        totalEquity = Math.round(totalEquity * 100) / 100;

        return {
            rows,
            totalAssets,
            totalLiabilities,
            totalEquity,
            balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
            asOfDate: dateLimit.toISOString().split('T')[0],
        };
    }

    /**
     * Generate an Excel workbook with:
     * 1. Transactions sheet (raw data)
     * 2. Balance Sheet sheet (with SUMIFS formulas)
     */
    async exportBalanceSheetExcel(userId: string, organizationId?: string, asOfDate?: string): Promise<ExcelJS.Workbook> {
        const dateLimit = asOfDate ? new Date(asOfDate) : new Date();
        dateLimit.setHours(23, 59, 59, 999);

        const where: any = organizationId
            ? { organizationId, date: { lte: dateLimit } }
            : { userId, date: { lte: dateLimit } };

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'asc' }
        });

        const wb = new ExcelJS.Workbook();
        wb.creator = 'Finora';
        wb.created = new Date();

        // ────────────────────────────────────────────────────────────
        // SHEET 1: Transactions
        // ────────────────────────────────────────────────────────────
        const txSheet = wb.addWorksheet('Transactions');
        txSheet.columns = [
            { header: 'Date', key: 'date', width: 14 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Category', key: 'category', width: 22 },
            { header: 'Description', key: 'description', width: 35 },
            { header: 'Amount', key: 'amount', width: 16 },
            { header: 'BS Account', key: 'bsAccount', width: 28 },
        ];

        // Header styling
        txSheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
            cell.alignment = { horizontal: 'center' };
        });

        for (const tx of transactions) {
            const bsAccount = classifyTransaction(tx.category, tx.type as 'INCOME' | 'EXPENSE');
            txSheet.addRow({
                date: tx.date,
                type: tx.type,
                category: tx.category,
                description: tx.description || '',
                amount: tx.amount,
                bsAccount,
            });
        }

        // Format amount column
        txSheet.getColumn('amount').numFmt = '₹#,##0.00';
        txSheet.getColumn('date').numFmt = 'DD-MMM-YYYY';

        // ────────────────────────────────────────────────────────────
        // SHEET 2: Balance Sheet (with SUMIFS formulas)
        // ────────────────────────────────────────────────────────────
        const bsSheet = wb.addWorksheet('Balance Sheet');
        bsSheet.getColumn(1).width = 5;   // Indentation
        bsSheet.getColumn(2).width = 38;  // Account name
        bsSheet.getColumn(3).width = 22;  // Amount

        const txCount = transactions.length;
        const dateCol = 'Transactions!$A$2:$A$' + (txCount + 1);
        const amtCol = 'Transactions!$E$2:$E$' + (txCount + 1);
        const typeCol = 'Transactions!$B$2:$B$' + (txCount + 1);
        const bsAcctCol = 'Transactions!$F$2:$F$' + (txCount + 1);

        // ── Control Panel ────────────────────────────────────────
        const r1 = bsSheet.addRow(['', 'BALANCE SHEET', '']);
        r1.getCell(2).font = { bold: true, size: 16 };
        r1.getCell(2).alignment = { horizontal: 'center' };
        bsSheet.mergeCells('B1:C1');

        const r2 = bsSheet.addRow(['', 'As-Of Date:', dateLimit]);
        r2.getCell(2).font = { bold: true, color: { argb: 'FF1F4E79' } };
        r2.getCell(3).numFmt = 'DD-MMM-YYYY';
        r2.getCell(3).font = { bold: true, color: { argb: 'FF0000FF' } };
        r2.getCell(3).fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' }
        };
        // Name the date cell for formula reference
        const asOfDateCell = 'C2';

        bsSheet.addRow([]); // Spacer

        // Currency format
        const currFmt = '₹#,##0.00;(₹#,##0.00)';
        let currentRow = 4;

        // Helper to add a section
        const addSectionHeader = (title: string) => {
            const row = bsSheet.addRow(['', title, '']);
            row.getCell(2).font = { bold: true, size: 13 };
            row.getCell(2).fill = {
                type: 'pattern', pattern: 'solid',
                fgColor: { argb: 'FFD9E2F3' }
            };
            row.getCell(3).fill = {
                type: 'pattern', pattern: 'solid',
                fgColor: { argb: 'FFD9E2F3' }
            };
            currentRow++;
        };

        const addSubSectionHeader = (title: string) => {
            const row = bsSheet.addRow(['', `  ${title}`, '']);
            row.getCell(2).font = { bold: true, italic: true, size: 11 };
            currentRow++;
        };

        const lineItemRows: Record<string, number> = {}; // track row numbers for subtotals

        const addLineItem = (account: string, section: BSSection) => {
            const row = bsSheet.addRow(['', `    ${account}`, null]);
            const cellRef = `C${currentRow}`;
            lineItemRows[account] = currentRow;

            // Build SUMIFS formula
            if (account === 'Cash & Cash Equivalents') {
                // Cash = all INCOME - all EXPENSE where BS Account = "Cash & Cash Equivalents"
                // + specific mapped income (direct cash) - specific mapped expense
                // Simplified: SUMIFS for income mapped to cash - SUMIFS for expense mapped to cash
                // + unmatched income - unmatched expense
                row.getCell(3).value = {
                    formula: `SUMIFS(${amtCol},${typeCol},"INCOME",${bsAcctCol},"Cash & Cash Equivalents")-SUMIFS(${amtCol},${typeCol},"EXPENSE",${bsAcctCol},"Cash & Cash Equivalents")-SUMIFS(${amtCol},${typeCol},"EXPENSE",${bsAcctCol},"Property, Plant & Equipment")-SUMIFS(${amtCol},${typeCol},"EXPENSE",${bsAcctCol},"Intangible Assets")-SUMIFS(${amtCol},${typeCol},"EXPENSE",${bsAcctCol},"Inventory")-SUMIFS(${amtCol},${typeCol},"EXPENSE",${bsAcctCol},"Prepaid Expenses")`,
                    result: undefined
                };
            } else if (account === 'Retained Earnings') {
                // Net Income = Total Income - Total Expense
                row.getCell(3).value = {
                    formula: `SUMIFS(${amtCol},${typeCol},"INCOME")-SUMIFS(${amtCol},${typeCol},"EXPENSE")`,
                    result: undefined
                };
            } else {
                // Standard: SUMIFS on BS Account column
                row.getCell(3).value = {
                    formula: `SUMIFS(${amtCol},${bsAcctCol},"${account}")`,
                    result: undefined
                };
            }

            row.getCell(3).numFmt = currFmt;
            row.getCell(3).font = { color: { argb: 'FF008000' } }; // Green for formula cells
            currentRow++;

            return cellRef;
        };

        const addSubtotalRow = (label: string, startRow: number, endRow: number) => {
            const row = bsSheet.addRow(['', `  ${label}`, null]);
            row.getCell(3).value = {
                formula: `SUM(C${startRow}:C${endRow})`,
                result: undefined
            };
            row.getCell(2).font = { bold: true };
            row.getCell(3).font = { bold: true };
            row.getCell(3).numFmt = currFmt;
            row.getCell(3).border = { top: { style: 'thin' } };
            const ref = `C${currentRow}`;
            currentRow++;
            return ref;
        };

        const addTotalRow = (label: string, subtotalRefs: string[]) => {
            const row = bsSheet.addRow(['', label, null]);
            row.getCell(3).value = {
                formula: subtotalRefs.join('+'),
                result: undefined
            };
            row.getCell(2).font = { bold: true, size: 12 };
            row.getCell(3).font = { bold: true, size: 12 };
            row.getCell(3).numFmt = currFmt;
            row.getCell(3).border = {
                top: { style: 'double' },
                bottom: { style: 'double' },
            };
            const ref = `C${currentRow}`;
            currentRow++;
            return ref;
        };

        // ── BUILD SECTIONS ───────────────────────────────────────
        const sections: BSSection[] = ['ASSETS', 'LIABILITIES', 'EQUITY'];
        const sectionTotalRefs: Record<BSSection, string> = {} as any;

        for (const section of sections) {
            addSectionHeader(section);
            const sectionItems = CHART_OF_ACCOUNTS.filter(i => i.section === section);
            const subSections = [...new Set(sectionItems.map(i => i.subSection))];
            const subTotalRefs: string[] = [];

            for (const sub of subSections) {
                addSubSectionHeader(sub);
                const subItems = sectionItems.filter(i => i.subSection === sub);
                const startRow = currentRow;

                for (const item of subItems) {
                    addLineItem(item.account, section);
                }

                const endRow = currentRow - 1;
                const stRef = addSubtotalRow(`Total ${sub}`, startRow, endRow);
                subTotalRefs.push(stRef);

                bsSheet.addRow([]); // spacer
                currentRow++;
            }

            const totalRef = addTotalRow(`TOTAL ${section}`, subTotalRefs);
            sectionTotalRefs[section] = totalRef;

            bsSheet.addRow([]); // spacer
            currentRow++;
        }

        // ── Balance Check Row ────────────────────────────────────
        bsSheet.addRow([]); currentRow++;
        const checkRow = bsSheet.addRow(['', 'Balance Check (A - L - E)', null]);
        checkRow.getCell(3).value = {
            formula: `${sectionTotalRefs['ASSETS']}-${sectionTotalRefs['LIABILITIES']}-${sectionTotalRefs['EQUITY']}`,
            result: undefined
        };
        checkRow.getCell(2).font = { bold: true, italic: true };
        checkRow.getCell(3).font = { bold: true };
        checkRow.getCell(3).numFmt = currFmt;
        // Conditional: should be 0 if balanced
        currentRow++;

        return wb;
    }
}
