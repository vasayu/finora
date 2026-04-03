"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const database_1 = require("../../config/database");
const transactions_repository_1 = require("./transactions.repository");
const exceljs_1 = __importDefault(require("exceljs"));
class TransactionsService {
    repository;
    constructor() {
        this.repository = new transactions_repository_1.TransactionsRepository();
    }
    async evaluateExpenseAlert(userId, organizationId) {
        const txWhere = organizationId ? { organizationId } : { userId };
        const allTx = await database_1.prisma.transaction.findMany({ where: txWhere });
        let totalIncome = 0;
        let totalExpense = 0;
        for (const tx of allTx) {
            if (tx.type === 'INCOME')
                totalIncome += tx.amount;
            if (tx.type === 'EXPENSE')
                totalExpense += tx.amount;
        }
        const isHighExpense = totalIncome > 0 && totalExpense > (0.5 * totalIncome);
        if (isHighExpense) {
            const existingAlert = await database_1.prisma.alert.findFirst({
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
                await database_1.prisma.alert.create({
                    data: {
                        userId,
                        type: 'HIGH_EXPENSE',
                        message: `Warning: Your expenses (${percentage}%) have exceeded 50% of your total income.`,
                    }
                });
            }
        }
        else {
            // Expenses are normal, clear any existing HIGH_EXPENSE alerts for the user
            await database_1.prisma.alert.deleteMany({
                where: {
                    userId,
                    type: 'HIGH_EXPENSE'
                }
            });
        }
    }
    async createTransaction(userId, data) {
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
    async getTransaction(id) {
        return this.repository.findById(id);
    }
    async getTransactions(organizationId, userId) {
        return this.repository.findAll(organizationId, userId);
    }
    async updateTransaction(id, userId, data) {
        const tx = await this.repository.findById(id);
        if (!tx)
            throw new Error("Transaction not found");
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
    async deleteTransaction(id, userId, role) {
        const tx = await this.repository.findById(id);
        if (!tx)
            throw new Error("Transaction not found");
        if (tx.userId !== userId && role !== 'CFO' && role !== 'ACCOUNTANT') {
            throw new Error("Unauthorized to delete this transaction");
        }
        const deletedTx = await this.repository.deleteTransaction(id);
        await this.evaluateExpenseAlert(tx.userId, tx.organizationId || undefined);
        return deletedTx;
    }
    async generateTemplate() {
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Transactions Template');
        sheet.columns = [
            { header: 'Date (YYYY-MM-DD)', key: 'date', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Type (INCOME/EXPENSE)', key: 'type', width: 25 },
            { header: 'Category', key: 'category', width: 25 },
            { header: 'Description', key: 'description', width: 40 }
        ];
        // Style the header
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        // Add a sample row to guide the user
        sheet.addRow({
            date: new Date().toISOString().split('T')[0],
            amount: 1500,
            type: 'EXPENSE',
            category: 'Marketing',
            description: 'Monthly ad spend'
        });
        // Add data validation to the Type column
        for (let i = 2; i <= 1000; i++) {
            sheet.getCell(`C${i}`).dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"INCOME,EXPENSE"']
            };
        }
        return workbook;
    }
    async importTransactions(userId, fileBuffer, organizationId) {
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const sheet = workbook.worksheets[0];
        if (!sheet)
            throw new Error("Excel file has no worksheets");
        const transactionsData = [];
        let rowCount = 0;
        // Start reading from row 2 (skipping header)
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return; // Skip header
            const dateVal = row.getCell(1).value;
            const amountVal = row.getCell(2).value;
            const typeVal = row.getCell(3).value?.toString().toUpperCase();
            const categoryVal = row.getCell(4).value?.toString() || 'General';
            const descriptionVal = row.getCell(5).value?.toString() || '';
            // Skip empty rows
            if (!dateVal && !amountVal && !typeVal)
                return;
            // Validate basic required fields for the row
            if (!amountVal || isNaN(Number(amountVal))) {
                throw new Error(`Row ${rowNumber}: Invalid amount "${amountVal}"`);
            }
            if (typeVal !== 'INCOME' && typeVal !== 'EXPENSE') {
                throw new Error(`Row ${rowNumber}: Type must be INCOME or EXPENSE`);
            }
            let parsedDate = new Date();
            if (dateVal) {
                // Handle native excel dates or strings
                parsedDate = dateVal instanceof Date ? dateVal : new Date(dateVal.toString());
                if (isNaN(parsedDate.getTime())) {
                    throw new Error(`Row ${rowNumber}: Invalid date format`);
                }
            }
            transactionsData.push({
                userId,
                organizationId: organizationId || null,
                amount: Number(amountVal),
                currency: 'USD',
                type: typeVal,
                category: categoryVal.trim(),
                description: descriptionVal.trim(),
                date: parsedDate,
            });
            rowCount++;
        });
        if (transactionsData.length === 0) {
            throw new Error("No valid transactions found in the file.");
        }
        // Bulk insert locally using Prisma transactional boundaries
        const result = await database_1.prisma.$transaction(async (tx) => {
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
exports.TransactionsService = TransactionsService;
