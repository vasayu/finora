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
        const pnl = await this.finService.getPnL(req.user.id, organizationId, startDate, endDate);
        res.status(200).json({ status: 'success', data: pnl });
    });
    getBalanceSheet = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId, asOfDate } = req.query;
        const balanceSheet = await this.finService.getBalanceSheet(req.user.id, organizationId, asOfDate);
        res.status(200).json({ status: 'success', data: balanceSheet });
    });
    exportBalanceSheet = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId, asOfDate } = req.query;
        const workbook = await this.finService.exportBalanceSheetExcel(req.user.id, organizationId, asOfDate);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=BalanceSheet_${new Date().toISOString().split('T')[0]}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    });
}
exports.FinancialsController = FinancialsController;
