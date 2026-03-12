import { WatchlistRepository } from './watchlist.repository';

export class WatchlistService {
    private repository = new WatchlistRepository();

    async getUserWatchlist(userId: string) {
        return this.repository.getUserWatchlist(userId);
    }

    async addToUserWatchlist(userId: string, symbol: string, name: string) {
        return this.repository.addToUserWatchlist(userId, symbol, name);
    }

    async removeFromUserWatchlist(userId: string, symbol: string) {
        return this.repository.removeFromUserWatchlist(userId, symbol);
    }

    async getOrgWatchlist(organizationId: string) {
        return this.repository.getOrgWatchlist(organizationId);
    }

    async addToOrgWatchlist(organizationId: string, symbol: string, name: string, userId: string) {
        return this.repository.addToOrgWatchlist(organizationId, symbol, name, userId);
    }

    async removeFromOrgWatchlist(organizationId: string, symbol: string) {
        return this.repository.removeFromOrgWatchlist(organizationId, symbol);
    }
}

export const watchlistService = new WatchlistService();
