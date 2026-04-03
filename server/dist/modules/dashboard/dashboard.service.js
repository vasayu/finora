"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const database_1 = require("../../config/database");
class DashboardService {
    async getSummary(userId, organizationId) {
        // Build where clause — filter by org if provided, otherwise by user
        const txWhere = organizationId ? { organizationId } : { userId };
        const transactions = await database_1.prisma.transaction.findMany({ where: txWhere });
        let totalRevenue = 0;
        let totalExpenses = 0;
        // Group transactions by month for the chart
        const chartDataMap = new Map();
        // Initialize the last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            chartDataMap.set(monthStr, { month: monthStr, revenue: 0, expenses: 0 });
        }
        for (const tx of transactions) {
            if (tx.type === 'INCOME')
                totalRevenue += tx.amount;
            if (tx.type === 'EXPENSE')
                totalExpenses += tx.amount;
            const monthStr = tx.date.toLocaleString('default', { month: 'short' });
            if (chartDataMap.has(monthStr)) {
                const data = chartDataMap.get(monthStr);
                if (tx.type === 'INCOME')
                    data.revenue += tx.amount;
                if (tx.type === 'EXPENSE')
                    data.expenses += tx.amount;
            }
        }
        const profit = totalRevenue - totalExpenses;
        const cashFlow = totalRevenue - totalExpenses;
        const alertCount = await database_1.prisma.alert.count({ where: { userId } });
        const unreadAlertCount = await database_1.prisma.alert.count({ where: { userId, isRead: false } });
        const recentAlerts = await database_1.prisma.alert.findMany({
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
        const latestIncomeTx = await database_1.prisma.transaction.findFirst({
            where: { ...txWhere, type: 'INCOME' },
            orderBy: { date: 'desc' },
        });
        const latestExpenseTx = await database_1.prisma.transaction.findFirst({
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
exports.DashboardService = DashboardService;
