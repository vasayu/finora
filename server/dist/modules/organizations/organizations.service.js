"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const organizations_repository_1 = require("./organizations.repository");
class OrganizationsService {
    repository;
    constructor() {
        this.repository = new organizations_repository_1.OrganizationsRepository();
    }
    async createOrganization(data) {
        return this.repository.create(data);
    }
    async getOrganization(id) {
        const org = await this.repository.findById(id);
        if (!org)
            throw { statusCode: 404, message: 'Organization not found' };
        return org;
    }
    async getAllOrganizations() {
        return this.repository.findAll();
    }
}
exports.OrganizationsService = OrganizationsService;
