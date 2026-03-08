import { OrganizationsRepository } from './organizations.repository';
import crypto from 'crypto';

export class OrganizationsService {
    private repository: OrganizationsRepository;

    constructor() {
        this.repository = new OrganizationsRepository();
    }

    private generateInviteCode(): string {
        return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char hex
    }

    async createOrganization(name: string, userId: string) {
        const inviteCode = this.generateInviteCode();
        const org = await this.repository.create({ name, inviteCode, ownerId: userId });
        return org;
    }

    async joinOrganization(inviteCode: string, userId: string) {
        const org = await this.repository.findByInviteCode(inviteCode);
        if (!org) {
            throw { statusCode: 404, message: 'Invalid invite code. Organization not found.' };
        }

        await this.repository.addUserToOrg(userId, org.id);

        // Return the full org with members
        return this.repository.findById(org.id);
    }

    async getMyOrganization(userId: string, organizationId: string | null) {
        if (!organizationId) {
            return null;
        }
        return this.repository.findById(organizationId);
    }

    async getOrganization(id: string) {
        const org = await this.repository.findById(id);
        if (!org) throw { statusCode: 404, message: 'Organization not found' };
        return org;
    }

    async getAllOrganizations() {
        return this.repository.findAll();
    }
}
