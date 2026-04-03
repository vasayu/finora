"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromOrgWatchlist = exports.addToOrgWatchlist = exports.getOrgWatchlist = exports.removeFromUserWatchlist = exports.addToUserWatchlist = exports.getUserWatchlist = void 0;
const watchlist_service_1 = require("./watchlist.service");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getUserWatchlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const items = await watchlist_service_1.watchlistService.getUserWatchlist(req.user.id);
    res.status(200).json({ status: 'success', data: items });
});
exports.addToUserWatchlist = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { symbol, name } = req.body;
    if (!symbol || !name) {
        return next({ statusCode: 400, message: 'symbol and name are required' });
    }
    const item = await watchlist_service_1.watchlistService.addToUserWatchlist(req.user.id, symbol, name);
    res.status(201).json({ status: 'success', data: item });
});
exports.removeFromUserWatchlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { symbol } = req.params;
    await watchlist_service_1.watchlistService.removeFromUserWatchlist(req.user.id, symbol);
    res.status(200).json({ status: 'success', message: 'Removed from watchlist' });
});
exports.getOrgWatchlist = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const items = await watchlist_service_1.watchlistService.getOrgWatchlist(orgId);
    res.status(200).json({ status: 'success', data: items });
});
exports.addToOrgWatchlist = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const { symbol, name } = req.body;
    if (!symbol || !name) {
        return next({ statusCode: 400, message: 'symbol and name are required' });
    }
    const item = await watchlist_service_1.watchlistService.addToOrgWatchlist(orgId, symbol, name, req.user.id);
    res.status(201).json({ status: 'success', data: item });
});
exports.removeFromOrgWatchlist = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const { symbol } = req.params;
    await watchlist_service_1.watchlistService.removeFromOrgWatchlist(orgId, symbol);
    res.status(200).json({ status: 'success', message: 'Removed from org watchlist' });
});
