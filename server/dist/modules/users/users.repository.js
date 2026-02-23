"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const database_1 = require("../../config/database");
class UsersRepository {
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, createdAt: true }
        });
    }
    async findAll() {
        return database_1.prisma.user.findMany({
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, createdAt: true }
        });
    }
    async update(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, updatedAt: true }
        });
    }
    async delete(id) {
        return database_1.prisma.user.delete({ where: { id } });
    }
}
exports.UsersRepository = UsersRepository;
