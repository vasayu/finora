"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsController = void 0;
const alerts_service_1 = require("./alerts.service");
const catchAsync_1 = require("../../utils/catchAsync");
class AlertsController {
    alertsService;
    constructor() {
        this.alertsService = new alerts_service_1.AlertsService();
    }
    getAlerts = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const alerts = await this.alertsService.getAlerts(req.user.id);
        res.status(200).json({ status: 'success', data: { alerts } });
    });
    markAsRead = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const alert = await this.alertsService.markAsRead(req.params.id);
        res.status(200).json({ status: 'success', data: { alert } });
    });
}
exports.AlertsController = AlertsController;
