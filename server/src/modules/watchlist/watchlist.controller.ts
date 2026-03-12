import { Request, Response, NextFunction } from 'express';
import { watchlistService } from './watchlist.service';
import { catchAsync } from '../../utils/catchAsync';

export const getUserWatchlist = catchAsync(async (req: Request, res: Response) => {
    const items = await watchlistService.getUserWatchlist(req.user.id);
    res.status(200).json({ status: 'success', data: items });
});

export const addToUserWatchlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol, name } = req.body;
    if (!symbol || !name) {
        return next({ statusCode: 400, message: 'symbol and name are required' });
    }
    const item = await watchlistService.addToUserWatchlist(req.user.id, symbol, name);
    res.status(201).json({ status: 'success', data: item });
});

export const removeFromUserWatchlist = catchAsync(async (req: Request, res: Response) => {
    const { symbol } = req.params;
    await watchlistService.removeFromUserWatchlist(req.user.id, symbol);
    res.status(200).json({ status: 'success', message: 'Removed from watchlist' });
});

export const getOrgWatchlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const items = await watchlistService.getOrgWatchlist(orgId);
    res.status(200).json({ status: 'success', data: items });
});

export const addToOrgWatchlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const { symbol, name } = req.body;
    if (!symbol || !name) {
        return next({ statusCode: 400, message: 'symbol and name are required' });
    }
    const item = await watchlistService.addToOrgWatchlist(orgId, symbol, name, req.user.id);
    res.status(201).json({ status: 'success', data: item });
});

export const removeFromOrgWatchlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.user.organizationId;
    if (!orgId) {
        return next({ statusCode: 400, message: 'You are not part of an organization' });
    }
    const { symbol } = req.params;
    await watchlistService.removeFromOrgWatchlist(orgId, symbol);
    res.status(200).json({ status: 'success', message: 'Removed from org watchlist' });
});
