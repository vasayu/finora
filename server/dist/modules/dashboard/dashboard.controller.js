"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const catchAsync_1 = require("../../utils/catchAsync");
class DashboardController {
    dashboardService;
    constructor() {
        this.dashboardService = new dashboard_service_1.DashboardService();
    }
    getSummary = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { organizationId } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }
        const summary = await this.dashboardService.getSummary(organizationId, req.user.id);
        res.status(200).json({ status: 'success', data: { summary } });
    });
}
exports.DashboardController = DashboardController;
