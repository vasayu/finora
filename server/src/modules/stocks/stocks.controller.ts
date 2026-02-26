// server/src/modules/stocks/stocks.controller.ts
import { Request, Response, NextFunction } from 'express';
import { stocksService } from './stocks.service';
import { catchAsync } from '../../utils/catchAsync';

export const getHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol, timeframe, limit } = req.query;
    if (!symbol || !timeframe) {
        return next({ statusCode: 400, message: "Symbol and timeframe query parameters are required" });
    }

    const history = await stocksService.getHistory(
        symbol.toString(),
        timeframe.toString(),
        limit ? parseInt(limit.toString()) : 100
    );

    res.status(200).json({
        status: 'success',
        data: history
    });
});

export const getPrediction = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol, currentPrice, timeframe } = req.body;

    if (!symbol || !currentPrice || !timeframe) {
        return next({ statusCode: 400, message: "Symbol, currentPrice, and timeframe are required in the request body" });
    }

    const aiPrediction = await stocksService.getPrediction(
        symbol,
        parseFloat(currentPrice),
        timeframe
    );

    res.status(200).json({
        status: 'success',
        data: aiPrediction
    });
});

export const getRealtime = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { symbol, lastPrice } = req.query;
    if (!symbol || !lastPrice) {
        return next({ statusCode: 400, message: "Symbol and lastPrice query parameters are required" });
    }

    const tick = await stocksService.getRealtime(
        symbol.toString(),
        parseFloat(lastPrice.toString())
    );

    res.status(200).json({
        status: 'success',
        data: tick
    });
});
