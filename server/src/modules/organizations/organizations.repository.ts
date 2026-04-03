import { prisma } from '../../config/database';

export class OrganizationsRepository {
    async create(data: { 
        name: string; 
        domain: string; 
        inviteCode: string; 
        ownerId: string;
        revenueRange?: string;
        fundingStage?: string;
        companyType?: string;
        stockTicker?: string;
        headquarters?: string;
        size?: string;
        linkedinUrl?: string;
    }) {
        return prisma.organization.create({
            data: {
                name: data.name,
                domain: data.domain,
                inviteCode: data.inviteCode,
                ownerId: data.ownerId,
                revenueRange: data.revenueRange,
                fundingStage: data.fundingStage,
                companyType: data.companyType,
                stockTicker: data.stockTicker,
                headquarters: data.headquarters,
                size: data.size,
                linkedinUrl: data.linkedinUrl,
                users: { connect: { id: data.ownerId } },
            } as any,
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

    async findByDomain(domain: string) {
        return prisma.organization.findUnique({
            where: { domain } as any,
        });
    }

    async addUserToOrg(userId: string, organizationId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { organizationId },
        });
    }

    async removeUserFromOrg(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { organizationId: null, role: 'EMPLOYEE' },
        });
    }

    async update(id: string, data: any) {
        return prisma.organization.update({
            where: { id },
            data,
            include: {
                users: {
                    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async delete(id: string) {
        // Manually cascade delete dependent records
        await prisma.transaction.deleteMany({ where: { organizationId: id } });
        await prisma.document.deleteMany({ where: { organizationId: id } });
        await prisma.orgWatchlist.deleteMany({ where: { organizationId: id } });
        await prisma.financialRecord.deleteMany({ where: { organizationId: id } });
        await prisma.user.updateMany({
            where: { organizationId: id },
            data: { organizationId: null, role: 'EMPLOYEE' }
        });

        return prisma.organization.delete({
            where: { id },
        });
    }

    async setUserRoleAndOrg(userId: string, organizationId: string, role: 'CFO' | 'MANAGER' | 'EMPLOYEE') {
        return prisma.user.update({
            where: { id: userId },
            data: { organizationId, role },
        });
    }

    async findAll() {
        return prisma.organization.findMany();
    }
}
