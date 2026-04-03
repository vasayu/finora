"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistRepository = void 0;
const database_1 = require("../../config/database");
class WatchlistRepository {
    async getUserWatchlist(userId) {
        return database_1.prisma.watchlist.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' },
        });
    }
    async addToUserWatchlist(userId, symbol, name) {
        return database_1.prisma.watchlist.upsert({
            where: { userId_symbol: { userId, symbol } },
            update: {},
            create: { userId, symbol, name },
        });
    }
    async removeFromUserWatchlist(userId, symbol) {
        return database_1.prisma.watchlist.deleteMany({
            where: { userId, symbol },
        });
    }
    async getOrgWatchlist(organizationId) {
        return database_1.prisma.orgWatchlist.findMany({
            where: { organizationId },
            orderBy: { addedAt: 'desc' },
        });
    }
    async addToOrgWatchlist(organizationId, symbol, name, addedByUserId) {
        return database_1.prisma.orgWatchlist.upsert({
            where: { organizationId_symbol: { organizationId, symbol } },
            update: {},
            create: { organizationId, symbol, name, addedByUserId },
        });
    }
    async removeFromOrgWatchlist(organizationId, symbol) {
        return database_1.prisma.orgWatchlist.deleteMany({
            where: { organizationId, symbol },
        });
    }
}
exports.WatchlistRepository = WatchlistRepository;
