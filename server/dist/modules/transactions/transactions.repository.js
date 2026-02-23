"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsRepository = void 0;
const database_1 = require("../../config/database");
class TransactionsRepository {
    async createTransaction(data) {
        return database_1.prisma.transaction.create({ data });
    }
    async findById(id) {
        return database_1.prisma.transaction.findUnique({ where: { id } });
    }
    async findAll(organizationId, userId) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        if (userId)
            where.userId = userId;
        return database_1.prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
    }
    async deleteTransaction(id) {
        return database_1.prisma.transaction.delete({ where: { id } });
    }
}
exports.TransactionsRepository = TransactionsRepository;
