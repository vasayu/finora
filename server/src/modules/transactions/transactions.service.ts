import { prisma } from '../../config/database';
import { TransactionsRepository } from './transactions.repository';
import ExcelJS, { Row } from 'exceljs';

export class TransactionsService {
    private repository: TransactionsRepository;

    constructor() {
        this.repository = new TransactionsRepository();
    }

    private async evaluateExpenseAlert(userId: string, organizationId?: string) {
        const txWhere: any = organizationId ? { organizationId } : { userId };
        const allTx = await prisma.transaction.findMany({ where: txWhere });
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        for (const tx of allTx) {
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') totalExpense += tx.amount;
        }

        const isHighExpense = totalIncome > 0 && totalExpense > (0.5 * totalIncome);

        if (isHighExpense) {
            const existingAlert = await prisma.alert.findFirst({
                where: { 
                    userId, 
                    type: 'HIGH_EXPENSE',
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)) // only 1 per day max
                    }
                }
            });

            if (!existingAlert) {
                const percentage = Math.round((totalExpense / totalIncome) * 100);
                await prisma.alert.create({
                    data: {
                        userId,
                        type: 'HIGH_EXPENSE',
                        message: `Warning: Your expenses (${percentage}%) have exceeded 50% of your total income.`,
                    }
                });
            }
        } else {
            // Expenses are normal, clear any existing HIGH_EXPENSE alerts for the user
            await prisma.alert.deleteMany({
                where: { 
                    userId, 
                    type: 'HIGH_EXPENSE' 
                }
            });
        }
    }

    async createTransaction(userId: string, data: any) {
        const transaction = await this.repository.createTransaction({
            amount: data.amount,
            currency: data.currency || 'USD',
            type: data.type,
            category: data.category,
            date: data.date ? new Date(data.date) : new Date(),
            description: data.description,
            user: { connect: { id: userId } },
            ...(data.organizationId && { organization: { connect: { id: data.organizationId } } })
        });

        await this.evaluateExpenseAlert(userId, data.organizationId);

        return transaction;
    }

    async getTransaction(id: string) {
        return this.repository.findById(id);
    }

    async getTransactions(organizationId?: string, userId?: string) {
        return this.repository.findAll(organizationId, userId);
    }

    async updateTransaction(id: string, userId: string, data: any) {
        const tx = await this.repository.findById(id);
        if (!tx) throw new Error("Transaction not found");
        if (tx.userId !== userId && tx.organizationId !== data.organizationId) {
            throw new Error("Unauthorized to edit this transaction");
        }

        const updatedTx = await this.repository.updateTransaction(id, {
            amount: data.amount,
            currency: data.currency,
            type: data.type,
            category: data.category,
            description: data.description,
            ...(data.date && { date: new Date(data.date) })
        });

        await this.evaluateExpenseAlert(tx.userId, tx.organizationId || undefined);
        return updatedTx;
    }

    async deleteTransaction(id: string, userId: string, role?: string) {
        const tx = await this.repository.findById(id);
        if (!tx) throw new Error("Transaction not found");
        if (tx.userId !== userId && role !== 'CFO' && role !== 'ACCOUNTANT') {
            throw new Error("Unauthorized to delete this transaction");
        }
        
        const deletedTx = await this.repository.deleteTransaction(id);
        await this.evaluateExpenseAlert(tx.userId, tx.organizationId || undefined);
        return deletedTx;
    }

    async generateTemplate() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions Template');

        // Column order: Date, Type, Category, Description, Amount
        sheet.columns = [
            { header: 'Date (YYYY-MM-DD)', key: 'date',        width: 20 },
            { header: 'Type (INCOME/EXPENSE)', key: 'type',   width: 22 },
            { header: 'Category',             key: 'category', width: 25 },
            { header: 'Description',          key: 'description', width: 40 },
            { header: 'Amount',               key: 'amount',   width: 15 },
        ];

        // Style the header row
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add sample rows to guide the user
        sheet.addRow({
            date: new Date().toISOString().split('T')[0],
            type: 'EXPENSE',
            category: 'Marketing',
            description: 'Monthly ad spend',
            amount: 1500,
        });
        sheet.addRow({
            date: new Date().toISOString().split('T')[0],
            type: 'INCOME',
            category: 'Sales',
            description: 'Product sale',
            amount: 5000,
        });

        // Data validation on column B (Type) — rows 2 to 1000
        for (let i = 2; i <= 1000; i++) {
            sheet.getCell(`B${i}`).dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"INCOME,EXPENSE"']
            };
        }

        return workbook;
    }

    async importTransactions(userId: string, fileBuffer: any, organizationId?: string) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const sheet = workbook.worksheets[0];

        if (!sheet) throw new Error("Excel file has no worksheets");

        const transactionsData: any[] = [];
        let rowCount = 0;

        // Start reading from row 2 (skipping header)
        // Column order: 1=Date, 2=Type, 3=Category, 4=Description, 5=Amount
        sheet.eachRow((row: Row, rowNumber: number) => {
            if (rowNumber === 1) return; // Skip header

            const dateVal        = row.getCell(1).value;
            const typeVal        = row.getCell(2).value?.toString().toUpperCase().trim();
            const categoryVal    = row.getCell(3).value?.toString().trim() || 'General';
            const descriptionVal = row.getCell(4).value?.toString().trim() || '';
            const amountVal      = row.getCell(5).value;

            // Skip completely empty rows
            if (!dateVal && !amountVal && !typeVal) return;

            // Validate amount
            if (!amountVal || isNaN(Number(amountVal))) {
                throw new Error(`Row ${rowNumber}: Invalid amount "${amountVal}"`);
            }

            // Validate type
            if (typeVal !== 'INCOME' && typeVal !== 'EXPENSE') {
                throw new Error(`Row ${rowNumber}: Type must be INCOME or EXPENSE (got "${typeVal}")`);
            }

            // Parse date — handles both native Excel date objects and strings
            let parsedDate = new Date();
            if (dateVal) {
                parsedDate = dateVal instanceof Date ? dateVal : new Date(dateVal.toString());
                if (isNaN(parsedDate.getTime())) {
                    throw new Error(`Row ${rowNumber}: Invalid date format "${dateVal}"`);
                }
            }

            transactionsData.push({
                userId,
                organizationId: organizationId || null,
                amount: Math.abs(Number(amountVal)),
                currency: 'USD',
                type: typeVal,
                category: categoryVal,
                description: descriptionVal,
                date: parsedDate,
            });
            rowCount++;
        });

        if (transactionsData.length === 0) {
            throw new Error("No valid transactions found in the file.");
        }

        // Bulk insert locally using Prisma transactional boundaries
        const result = await prisma.$transaction(async (tx) => {
            return await tx.transaction.createMany({
                data: transactionsData,
                skipDuplicates: false, // Or true depending on your preference
            });
        });

        // Trigger the alerts check now that the transactions are in
        await this.evaluateExpenseAlert(userId, organizationId);

        return {
            importedCount: result.count,
            message: `Successfully imported ${result.count} transactions.`
        };
    }
}
