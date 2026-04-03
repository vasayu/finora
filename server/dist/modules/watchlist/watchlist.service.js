"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchlistService = exports.WatchlistService = void 0;
const watchlist_repository_1 = require("./watchlist.repository");
class WatchlistService {
    repository = new watchlist_repository_1.WatchlistRepository();
    async getUserWatchlist(userId) {
        return this.repository.getUserWatchlist(userId);
    }
    async addToUserWatchlist(userId, symbol, name) {
        return this.repository.addToUserWatchlist(userId, symbol, name);
    }
    async removeFromUserWatchlist(userId, symbol) {
        return this.repository.removeFromUserWatchlist(userId, symbol);
    }
    async getOrgWatchlist(organizationId) {
        return this.repository.getOrgWatchlist(organizationId);
    }
    async addToOrgWatchlist(organizationId, symbol, name, userId) {
        return this.repository.addToOrgWatchlist(organizationId, symbol, name, userId);
    }
    async removeFromOrgWatchlist(organizationId, symbol) {
        return this.repository.removeFromOrgWatchlist(organizationId, symbol);
    }
}
exports.WatchlistService = WatchlistService;
exports.watchlistService = new WatchlistService();
