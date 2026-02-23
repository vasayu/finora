"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const database_1 = require("../../config/database");
class AlertsService {
    async getAlerts(userId) {
        return database_1.prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async markAsRead(id) {
        return database_1.prisma.alert.update({
            where: { id },
            data: { isRead: true }
        });
    }
    async createAlert(data) {
        return database_1.prisma.alert.create({ data });
    }
}
exports.AlertsService = AlertsService;
