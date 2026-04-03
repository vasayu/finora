"use strict";
/**
 * Chart of Accounts — maps transaction categories to Balance Sheet line items.
 *
 * RULES:
 * - INCOME transactions increase Cash (Asset) and increase Retained Earnings (Equity)
 * - EXPENSE transactions decrease Cash (Asset); the category determines the contra-account
 *
 * The mapping is used by the Balance Sheet service to aggregate transactions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_OF_ACCOUNTS = void 0;
exports.classifyTransaction = classifyTransaction;
exports.getAccountHierarchy = getAccountHierarchy;
/**
 * Chart of Accounts definition.
 * Categories are matched case-insensitively.
 * "Cash & Equivalents" is the default catch-all for unmatched categories.
 */
exports.CHART_OF_ACCOUNTS = [
    // ─── ASSETS ───────────────────────────────────────────────────────
    {
        section: 'ASSETS',
        subSection: 'Current Assets',
        account: 'Cash & Cash Equivalents',
        expenseCategories: [], // Cash is computed as a residual
        incomeCategories: [], // Cash is computed as a residual
    },
    {
        section: 'ASSETS',
        subSection: 'Current Assets',
        account: 'Accounts Receivable',
        expenseCategories: [],
        incomeCategories: ['invoice', 'receivable', 'credit sale', 'revenue', 'service income'],
    },
    {
        section: 'ASSETS',
        subSection: 'Current Assets',
        account: 'Inventory',
        expenseCategories: ['inventory', 'stock purchase', 'raw materials', 'goods'],
        incomeCategories: [],
    },
    {
        section: 'ASSETS',
        subSection: 'Current Assets',
        account: 'Prepaid Expenses',
        expenseCategories: ['insurance', 'prepaid', 'advance payment', 'deposit'],
        incomeCategories: [],
    },
    {
        section: 'ASSETS',
        subSection: 'Non-Current Assets',
        account: 'Property, Plant & Equipment',
        expenseCategories: ['equipment', 'property', 'vehicle', 'machinery', 'furniture', 'office equipment'],
        incomeCategories: [],
    },
    {
        section: 'ASSETS',
        subSection: 'Non-Current Assets',
        account: 'Intangible Assets',
        expenseCategories: ['software', 'license', 'patent', 'trademark', 'domain'],
        incomeCategories: [],
    },
    // ─── LIABILITIES ─────────────────────────────────────────────────
    {
        section: 'LIABILITIES',
        subSection: 'Current Liabilities',
        account: 'Accounts Payable',
        expenseCategories: ['vendor', 'supplier', 'purchase', 'procurement'],
        incomeCategories: [],
    },
    {
        section: 'LIABILITIES',
        subSection: 'Current Liabilities',
        account: 'Accrued Expenses',
        expenseCategories: ['utilities', 'rent', 'electricity', 'water', 'internet', 'phone', 'maintenance'],
        incomeCategories: [],
    },
    {
        section: 'LIABILITIES',
        subSection: 'Current Liabilities',
        account: 'Salaries Payable',
        expenseCategories: ['salary', 'wages', 'payroll', 'bonus', 'commission'],
        incomeCategories: [],
    },
    {
        section: 'LIABILITIES',
        subSection: 'Current Liabilities',
        account: 'Short-Term Debt',
        expenseCategories: ['short-term loan', 'overdraft', 'credit card'],
        incomeCategories: ['short-term borrowing'],
    },
    {
        section: 'LIABILITIES',
        subSection: 'Non-Current Liabilities',
        account: 'Long-Term Debt',
        expenseCategories: ['mortgage', 'long-term loan', 'term loan'],
        incomeCategories: ['loan received', 'long-term borrowing'],
    },
    {
        section: 'LIABILITIES',
        subSection: 'Non-Current Liabilities',
        account: 'Deferred Tax Liability',
        expenseCategories: ['deferred tax', 'tax provision'],
        incomeCategories: [],
    },
    // ─── EQUITY ──────────────────────────────────────────────────────
    {
        section: 'EQUITY',
        subSection: "Shareholders' Equity",
        account: 'Share Capital',
        expenseCategories: [],
        incomeCategories: ['capital', 'investment', 'equity injection', 'share capital'],
    },
    {
        section: 'EQUITY',
        subSection: "Shareholders' Equity",
        account: 'Retained Earnings',
        expenseCategories: [], // Computed: cumulative net income
        incomeCategories: [], // Computed: cumulative net income
    },
];
/**
 * Find the matching BS line item for a given transaction category and type.
 * Returns the account name, or 'Cash & Cash Equivalents' as fallback.
 */
function classifyTransaction(category, txType) {
    const cat = category.toLowerCase().trim();
    for (const item of exports.CHART_OF_ACCOUNTS) {
        const categories = txType === 'INCOME' ? item.incomeCategories : item.expenseCategories;
        if (categories.some(c => cat.includes(c) || c.includes(cat))) {
            return item.account;
        }
    }
    // Fallback: unclassified income/expense flows through Cash
    return 'Cash & Cash Equivalents';
}
/**
 * Get the full hierarchy structure (for building the BS output).
 */
function getAccountHierarchy() {
    return exports.CHART_OF_ACCOUNTS.map(item => ({
        section: item.section,
        subSection: item.subSection,
        account: item.account,
    }));
}
