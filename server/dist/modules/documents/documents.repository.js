"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsRepository = void 0;
const database_1 = require("../../config/database");
class DocumentsRepository {
    async createDocument(data) {
        return database_1.prisma.document.create({ data });
    }
    async getDocumentById(id) {
        return database_1.prisma.document.findUnique({ where: { id } });
    }
    async getAllDocuments(userId) {
        const where = userId ? { userId } : {};
        return database_1.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async updateDocumentStatus(id, status, extractedData) {
        return database_1.prisma.document.update({
            where: { id },
            data: { status, extractedData }
        });
    }
}
exports.DocumentsRepository = DocumentsRepository;
