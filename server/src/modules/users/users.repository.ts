import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class UsersRepository {
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, createdAt: true }
        });
    }

    async findAll() {
        return prisma.user.findMany({
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, createdAt: true }
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true, updatedAt: true }
        });
    }

    async delete(id: string) {
        return prisma.user.delete({ where: { id } });
    }
}
