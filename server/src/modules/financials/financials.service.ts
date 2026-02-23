import { prisma } from '../../config/database';

export class FinancialsService {
    async getPnL(organizationId: string, startDate?: string, endDate?: string) {
        const where: any = { organizationId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const transactions = await prisma.transaction.findMany({ where });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((tx) => {
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') totalExpense += tx.amount;
        });

        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            transactionsCount: transactions.length
        };
    }

    async getBalanceSheet(organizationId: string) {
        // Computes simplified metrics from the latest FinancialRecord
        const latestRecord = await prisma.financialRecord.findFirst({
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
