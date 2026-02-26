import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class AlertsService {
    async getAlerts(userId: string) {
        return prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async markAsRead(id: string) {
        return prisma.alert.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async createAlert(data: Prisma.AlertCreateInput) {
        return prisma.alert.create({ data });
    }
}
