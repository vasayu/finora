import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class AuthRepository {
    async createUser(data: Prisma.UserCreateInput) {
        return prisma.user.create({ data });
    }

    async findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async findUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }
}
