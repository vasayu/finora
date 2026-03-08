import { prisma } from '../../config/database';

export class OrganizationsRepository {
    async create(data: { name: string; inviteCode: string; ownerId: string }) {
        return prisma.organization.create({
            data: {
                name: data.name,
                inviteCode: data.inviteCode,
                ownerId: data.ownerId,
                users: { connect: { id: data.ownerId } },
            },
            include: { users: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
        });
    }

    async findById(id: string) {
        return prisma.organization.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async findByInviteCode(inviteCode: string) {
        return prisma.organization.findUnique({
            where: { inviteCode },
        });
    }

    async addUserToOrg(userId: string, organizationId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { organizationId },
        });
    }

    async findAll() {
        return prisma.organization.findMany();
    }
}
