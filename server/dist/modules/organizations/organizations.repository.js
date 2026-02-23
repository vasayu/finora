"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsRepository = void 0;
const database_1 = require("../../config/database");
class OrganizationsRepository {
    async create(data) {
        return database_1.prisma.organization.create({ data });
    }
    async findById(id) {
        return database_1.prisma.organization.findUnique({
            where: { id },
            include: { users: true }
        });
    }
    async findAll() {
        return database_1.prisma.organization.findMany();
    }
}
exports.OrganizationsRepository = OrganizationsRepository;
