import { prisma } from '../../config/database';

export class AuditService {
    async logAction(
        userId: string,
        action: string,
        entity: string,
        entityId: string,
        details?: any
    ) {
        return prisma.auditTrail.create({
            data: {
                action,
                entity,
                entityId,
                details,
                user: { connect: { id: userId } }
            }
        });
    }

    async getAuditLogs(organizationId?: string) {
        return prisma.auditTrail.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
}
