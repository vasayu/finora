import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

export class DashboardService {
    async getSummary(organizationId: string, userId: string) {
        const cacheKey = `dashboard:summary:${organizationId}:${userId}`;

        // Check cache
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // Aggregate real data if not in cache
        const transactionsCount = await prisma.transaction.count({
            where: { organizationId }
        });

        const documents = await prisma.document.groupBy({
            by: ['status'],
            where: { organizationId },
            _count: { id: true },
        });

        const recentAlerts = await prisma.alert.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        const summary = {
            transactionsCount,
            documentStatus: documents,
            recentAlerts,
        };

        // Cache the result for 5 minutes (300 seconds)
        await redis.setEx(cacheKey, 300, JSON.stringify(summary));

        return summary;
    }
}
