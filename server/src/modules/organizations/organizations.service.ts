import { OrganizationsRepository } from './organizations.repository';
import { prisma } from '../../config/database';
import { normalizeDomain } from '../../services/company.service';
import crypto from 'crypto';

export class OrganizationsService {
    private repository: OrganizationsRepository;

    constructor() {
        this.repository = new OrganizationsRepository();
    }

    private generateInviteCode(): string {
        return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char hex
    }

    async createOrganization(
        name: string, 
        domain: string, 
        role: string, 
        position: string, 
        userId: string,
        extraProps: any = {}
    ) {
        const inviteCode = this.generateInviteCode();
        const normalizedDomain = normalizeDomain(domain);
        
        let org = await this.repository.findByDomain(normalizedDomain);
        if (org) {
            throw { statusCode: 400, message: 'Organization with this domain already exists' };
        }

        org = await this.repository.create({ 
            name, domain: normalizedDomain, inviteCode, ownerId: userId,
            ...extraProps 
        });
        
        // Update user
        await prisma.user.update({
            where: { id: userId },
            data: { organizationId: org.id, role: role as 'CFO' | 'MANAGER' | 'EMPLOYEE', position }
        });
        
        return this.repository.findById(org.id);
    }

    async joinOrganization(domain: string, role: string, position: string, userId: string) {
        const normalizedDomain = normalizeDomain(domain);
        const org = await this.repository.findByDomain(normalizedDomain);
        if (!org) {
            throw { statusCode: 404, message: 'Organization not found. Please create it first.' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { organizationId: org.id, role: role as 'CFO' | 'MANAGER' | 'EMPLOYEE', position }
        });

        // Return the full org with members
        return this.repository.findById(org.id);
    }

    async getMyOrganization(userId: string, organizationId: string | null) {
        if (!organizationId) {
            return null;
        }
        return this.repository.findById(organizationId);
    }
    
    async getOrganizationMembers(organizationId: string) {
        const org = await this.repository.findById(organizationId);
        if (!org) throw { statusCode: 404, message: 'Organization not found' };
        
        const groupedUsers = org.users!.reduce(
            (acc: any, user: any) => {
                const roleLower = user.role.toLowerCase() as 'cfo' | 'manager' | 'employee';
                if (roleLower === 'cfo') {
                    acc.cfo.push(user);
                } else if (roleLower === 'manager') {
                    acc.managers.push(user);
                } else {
                    acc.employees.push(user);
                }
                return acc;
            },
            { cfo: [] as any[], managers: [] as any[], employees: [] as any[] }
        );
        return groupedUsers;
    }

    async getOrganization(id: string) {
        const org = await this.repository.findById(id);
        if (!org) throw { statusCode: 404, message: 'Organization not found' };
        return org;
    }

    async getAllOrganizations() {
        return this.repository.findAll();
    }

    async updateOrganization(organizationId: string, data: any) {
        // Find org to ensure it exists
        const org = await this.repository.findById(organizationId);
        if (!org) throw { statusCode: 404, message: 'Organization not found' };

        return this.repository.update(organizationId, data);
    }

    async leaveOrganization(userId: string, organizationId: string) {
        const org: any = await this.repository.findById(organizationId);
        if (!org) throw { statusCode: 404, message: 'Organization not found' };

        // Ensure user is in this org
        const isMember = org.users?.find((u: any) => u.id === userId);
        if (!isMember) throw { statusCode: 400, message: 'You are not a member of this organization' };

        // If the user is the owner, we could hand over ownership or delete the org.
        // For simplicity, if they are the only member, we delete the org.
        if (org.users?.length === 1 && org.ownerId === userId) {
            await this.repository.removeUserFromOrg(userId);
            await this.repository.delete(organizationId);
            return { message: 'Organization deleted' };
        }

        // Just leave
        await this.repository.removeUserFromOrg(userId);

        // If no members left, delete it anyway just in case
        const updatedOrg: any = await this.repository.findById(organizationId);
        if (!updatedOrg?.users?.length) {
             await this.repository.delete(organizationId);
        }

        return { message: 'Successfully left the organization' };
    }
}
