"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialsService = void 0;
const database_1 = require("../../config/database");
class FinancialsService {
    async getPnL(organizationId, startDate, endDate) {
        const where = { organizationId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const transactions = await database_1.prisma.transaction.findMany({ where });
        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach((tx) => {
            if (tx.type === 'INCOME')
                totalIncome += tx.amount;
            if (tx.type === 'EXPENSE')
                totalExpense += tx.amount;
        });
        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            transactionsCount: transactions.length
        };
    }
    async getBalanceSheet(organizationId) {
        // Computes simplified metrics from the latest FinancialRecord
        const latestRecord = await database_1.prisma.financialRecord.findFirst({
            where: { organizationId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        if (!latestRecord) {
            return {
                assets: 0,
                liabilities: 0,
                equity: 0
            };
        }
        return {
            assets: latestRecord.assets,
            liabilities: latestRecord.liabilities,
            equity: latestRecord.equity
        };
    }
}
exports.FinancialsService = FinancialsService;
