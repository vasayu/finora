"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtime = exports.getPrediction = exports.getHistory = exports.searchStocks = void 0;
const stocks_service_1 = require("./stocks.service");
const catchAsync_1 = require("../../utils/catchAsync");
exports.searchStocks = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const q = req.query.q || '';
    const results = stocks_service_1.stocksService.searchStocks(q);
    res.status(200).json({ status: 'success', data: results });
});
exports.getHistory = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { symbol, timeframe, limit } = req.query;
    if (!symbol || !timeframe) {
        return next({ statusCode: 400, message: "Symbol and timeframe query parameters are required" });
    }
    const history = await stocks_service_1.stocksService.getHistory(symbol.toString(), timeframe.toString(), limit ? parseInt(limit.toString()) : 100);
    res.status(200).json({
        status: 'success',
        data: history
    });
});
exports.getPrediction = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { symbol, currentPrice, timeframe } = req.body;
    if (!symbol || !currentPrice || !timeframe) {
        return next({ statusCode: 400, message: "Symbol, currentPrice, and timeframe are required in the request body" });
    }
    const aiPrediction = await stocks_service_1.stocksService.getPrediction(symbol, parseFloat(currentPrice), timeframe);
    res.status(200).json({
        status: 'success',
        data: aiPrediction
    });
});
exports.getRealtime = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { symbol, lastPrice } = req.query;
    if (!symbol || !lastPrice) {
        return next({ statusCode: 400, message: "Symbol and lastPrice query parameters are required" });
    }
    const tick = await stocks_service_1.stocksService.getRealtime(symbol.toString(), parseFloat(lastPrice.toString()));
    res.status(200).json({
        status: 'success',
        data: tick
    });
});
