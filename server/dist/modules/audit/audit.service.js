"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("../../config/database");
class AuditService {
    async logAction(userId, action, entity, entityId, details) {
        return database_1.prisma.auditTrail.create({
            data: {
                action,
                entity,
                entityId,
                details,
                user: { connect: { id: userId } }
            }
        });
    }
    async getAuditLogs(organizationId) {
        return database_1.prisma.auditTrail.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.AuditService = AuditService;
