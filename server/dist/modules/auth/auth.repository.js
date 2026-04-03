"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../../config/database");
class AuthRepository {
    async createUser(data) {
        return database_1.prisma.user.create({ data });
    }
    async findUserByEmail(email) {
        return database_1.prisma.user.findUnique({ where: { email } });
    }
    async findUserById(id) {
        return database_1.prisma.user.findUnique({ where: { id } });
    }
    async updateUser(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    async createRoleProfile(userId, role) {
        switch (role) {
            case 'EMPLOYEE':
                return database_1.prisma.employeeProfile.create({ data: { userId } });
            case 'ACCOUNTANT':
                return database_1.prisma.accountantProfile.create({ data: { userId } });
            case 'CFO':
                return database_1.prisma.cFOProfile.create({ data: { userId } });
            case 'MANAGER':
                return database_1.prisma.managerProfile.create({ data: { userId } });
            case 'INVESTOR':
                return database_1.prisma.investorProfile.create({ data: { userId } });
        }
    }
}
exports.AuthRepository = AuthRepository;
