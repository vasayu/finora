import { prisma } from '../../config/database';

export class DashboardService {
    async getSummary(userId: string, organizationId?: string) {
        // Build where clause — filter by org if provided, otherwise by user
        const txWhere: any = organizationId ? { organizationId } : { userId };

        const transactions = await prisma.transaction.findMany({ where: txWhere });

        let totalRevenue = 0;
        let totalExpenses = 0;

        // Group transactions by month for the chart
        const chartDataMap = new Map<string, { month: string; revenue: number; expenses: number }>();
        
        // Initialize the last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            chartDataMap.set(monthStr, { month: monthStr, revenue: 0, expenses: 0 });
        }

        for (const tx of transactions) {
            if (tx.type === 'INCOME') totalRevenue += tx.amount;
            if (tx.type === 'EXPENSE') totalExpenses += tx.amount;

            const monthStr = tx.date.toLocaleString('default', { month: 'short' });
            if (chartDataMap.has(monthStr)) {
                const data = chartDataMap.get(monthStr)!;
                if (tx.type === 'INCOME') data.revenue += tx.amount;
                if (tx.type === 'EXPENSE') data.expenses += tx.amount;
            }
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

        // Calculate server uptime in hours
        const serverUptimeHours = Math.floor(process.uptime() / 3600);
        const serverUptimeStr = serverUptimeHours > 0 
            ? `${serverUptimeHours}h ${Math.floor((process.uptime() % 3600) / 60)}m`
            : `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`;

        // Get latest transactions for trends
        const latestIncomeTx = await prisma.transaction.findFirst({
            where: { ...txWhere, type: 'INCOME' },
            orderBy: { date: 'desc' },
        });
        const latestExpenseTx = await prisma.transaction.findFirst({
            where: { ...txWhere, type: 'EXPENSE' },
            orderBy: { date: 'desc' },
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
            chartData: Array.from(chartDataMap.values()),
            serverUptime: serverUptimeStr,
            latestIncomeAmount: latestIncomeTx?.amount || 0,
            latestExpenseAmount: latestExpenseTx?.amount || 0,
        };
    }
}
