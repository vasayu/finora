import { prisma } from '../../config/database';
import { Prisma, Role } from '@prisma/client';

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

    async updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async createRoleProfile(userId: string, role: Role) {
        switch (role) {
            case 'EMPLOYEE':
                return prisma.employeeProfile.create({ data: { userId } });
            case 'ACCOUNTANT':
                return prisma.accountantProfile.create({ data: { userId } });
            case 'CFO':
                return prisma.cFOProfile.create({ data: { userId } });
            case 'MANAGER':
                return prisma.managerProfile.create({ data: { userId } });
            case 'INVESTOR':
                return prisma.investorProfile.create({ data: { userId } });
        }
    }
}
