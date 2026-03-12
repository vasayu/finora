import { prisma } from '../../config/database';

export class WatchlistRepository {
    async getUserWatchlist(userId: string) {
        return prisma.watchlist.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' },
        });
    }

    async addToUserWatchlist(userId: string, symbol: string, name: string) {
        return prisma.watchlist.upsert({
            where: { userId_symbol: { userId, symbol } },
            update: {},
            create: { userId, symbol, name },
        });
    }

    async removeFromUserWatchlist(userId: string, symbol: string) {
        return prisma.watchlist.deleteMany({
            where: { userId, symbol },
        });
    }

    async getOrgWatchlist(organizationId: string) {
        return prisma.orgWatchlist.findMany({
            where: { organizationId },
            orderBy: { addedAt: 'desc' },
        });
    }

    async addToOrgWatchlist(organizationId: string, symbol: string, name: string, addedByUserId: string) {
        return prisma.orgWatchlist.upsert({
            where: { organizationId_symbol: { organizationId, symbol } },
            update: {},
            create: { organizationId, symbol, name, addedByUserId },
        });
    }

    async removeFromOrgWatchlist(organizationId: string, symbol: string) {
        return prisma.orgWatchlist.deleteMany({
            where: { organizationId, symbol },
        });
    }
}
