import { OrganizationsRepository } from './organizations.repository';
import { Prisma } from '@prisma/client';

export class OrganizationsService {
    private repository: OrganizationsRepository;

    constructor() {
        this.repository = new OrganizationsRepository();
    }

    async createOrganization(data: Prisma.OrganizationCreateInput) {
        return this.repository.create(data);
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
