import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class TransactionsRepository {
    async createTransaction(data: Prisma.TransactionCreateInput) {
        return prisma.transaction.create({ data });
    }

    async findById(id: string) {
        return prisma.transaction.findUnique({ where: { id } });
    }

    async findAll(organizationId?: string, userId?: string) {
        const where: any = {};
        if (organizationId) where.organizationId = organizationId;
        if (userId) where.userId = userId;
        return prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
    }

    async deleteTransaction(id: string) {
        return prisma.transaction.delete({ where: { id } });
    }
}
