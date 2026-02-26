import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class DocumentsRepository {
    async createDocument(data: Prisma.DocumentCreateInput) {
        return prisma.document.create({ data });
    }

    async getDocumentById(id: string) {
        return prisma.document.findUnique({ where: { id } });
    }

    async getAllDocuments(userId?: string) {
        const where = userId ? { userId } : {};
        return prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async updateDocumentStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', extractedData?: any) {
        return prisma.document.update({
            where: { id },
            data: { status, extractedData }
        });
    }
}
