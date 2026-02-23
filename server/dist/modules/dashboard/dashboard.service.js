"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
class DashboardService {
    async getSummary(organizationId, userId) {
        const cacheKey = `dashboard:summary:${organizationId}:${userId}`;
        // Check cache
        const cachedData = await redis_1.redis.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        // Aggregate real data if not in cache
        const transactionsCount = await database_1.prisma.transaction.count({
            where: { organizationId }
        });
        const documents = await database_1.prisma.document.groupBy({
            by: ['status'],
            where: { organizationId },
            _count: { id: true },
        });
        const recentAlerts = await database_1.prisma.alert.findMany({
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
        await redis_1.redis.setEx(cacheKey, 300, JSON.stringify(summary));
        return summary;
    }
}
exports.DashboardService = DashboardService;
