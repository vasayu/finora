import { prisma } from '../../config/database';

export class DashboardService {
    async getSummary(userId: string, organizationId?: string) {
        // Build where clause — filter by org if provided, otherwise by user
        const txWhere: any = organizationId ? { organizationId } : { userId };

        const transactions = await prisma.transaction.findMany({ where: txWhere });

        let totalRevenue = 0;
        let totalExpenses = 0;

        for (const tx of transactions) {
            if (tx.type === 'INCOME') totalRevenue += tx.amount;
            if (tx.type === 'EXPENSE') totalExpenses += tx.amount;
        }

        const profit = totalRevenue - totalExpenses;
        const cashFlow = totalRevenue - totalExpenses;

        const alertCount = await prisma.alert.count({ where: { userId } });
        const unreadAlertCount = await prisma.alert.count({ where: { userId, isRead: false } });

        const recentAlerts = await prisma.alert.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        return {
            totalRevenue,
            totalExpenses,
            profit,
            cashFlow,
            transactionsCount: transactions.length,
            alertCount,
            unreadAlertCount,
            recentAlerts,
        };
    }
}
