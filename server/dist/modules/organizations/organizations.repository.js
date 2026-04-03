"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsRepository = void 0;
const database_1 = require("../../config/database");
class OrganizationsRepository {
    async create(data) {
        return database_1.prisma.organization.create({
            data: {
                name: data.name,
                inviteCode: data.inviteCode,
                ownerId: data.ownerId,
                users: { connect: { id: data.ownerId } },
            },
            include: { users: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
        });
    }
    async findById(id) {
        return database_1.prisma.organization.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    async findByInviteCode(inviteCode) {
        return database_1.prisma.organization.findUnique({
            where: { inviteCode },
        });
    }
    async addUserToOrg(userId, organizationId) {
        return database_1.prisma.user.update({
            where: { id: userId },
            data: { organizationId },
        });
    }
    async findAll() {
        return database_1.prisma.organization.findMany();
    }
}
exports.OrganizationsRepository = OrganizationsRepository;
