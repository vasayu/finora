"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialsController = void 0;
const financials_service_1 = require("./financials.service");
const catchAsync_1 = require("../../utils/catchAsync");
class FinancialsController {
    finService;
    constructor() {
        this.finService = new financials_service_1.FinancialsService();
    }
    getPnL = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId, startDate, endDate } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }
        const pnl = await this.finService.getPnL(organizationId, startDate, endDate);
        res.status(200).json({ status: 'success', data: { pnl } });
    });
    getBalanceSheet = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }
        const balanceSheet = await this.finService.getBalanceSheet(organizationId);
        res.status(200).json({ status: 'success', data: { balanceSheet } });
    });
}
exports.FinancialsController = FinancialsController;
