import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class OrganizationsRepository {
    async create(data: Prisma.OrganizationCreateInput) {
        return prisma.organization.create({ data });
    }

    async findById(id: string) {
        return prisma.organization.findUnique({
            where: { id },
            include: { users: true }
        });
    }

    async findAll() {
        return prisma.organization.findMany();
    }
}
