"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const organizations_repository_1 = require("./organizations.repository");
const crypto_1 = __importDefault(require("crypto"));
class OrganizationsService {
    repository;
    constructor() {
        this.repository = new organizations_repository_1.OrganizationsRepository();
    }
    generateInviteCode() {
        return crypto_1.default.randomBytes(4).toString('hex').toUpperCase(); // 8-char hex
    }
    async createOrganization(name, userId) {
        const inviteCode = this.generateInviteCode();
        const org = await this.repository.create({ name, inviteCode, ownerId: userId });
        return org;
    }
    async joinOrganization(inviteCode, userId) {
        const org = await this.repository.findByInviteCode(inviteCode);
        if (!org) {
            throw { statusCode: 404, message: 'Invalid invite code. Organization not found.' };
        }
        await this.repository.addUserToOrg(userId, org.id);
        // Return the full org with members
        return this.repository.findById(org.id);
    }
    async getMyOrganization(userId, organizationId) {
        if (!organizationId) {
            return null;
        }
        return this.repository.findById(organizationId);
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
