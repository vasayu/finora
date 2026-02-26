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
}
exports.AuthRepository = AuthRepository;
