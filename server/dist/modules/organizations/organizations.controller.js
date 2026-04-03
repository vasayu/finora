"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsController = void 0;
const organizations_service_1 = require("./organizations.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const createOrgSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Organization name must be at least 2 characters'),
});
const joinOrgSchema = zod_1.z.object({
    inviteCode: zod_1.z.string().min(1, 'Invite code is required'),
});
class OrganizationsController {
    orgService;
    constructor() {
        this.orgService = new organizations_service_1.OrganizationsService();
    }
    createOrganization = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { name } = createOrgSchema.parse(req.body);
        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }
        const org = await this.orgService.createOrganization(name, req.user.id);
        res.status(201).json({ status: 'success', data: { organization: org } });
    });
    joinOrganization = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { inviteCode } = joinOrgSchema.parse(req.body);
        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }
        const org = await this.orgService.joinOrganization(inviteCode, req.user.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });
    getMyOrganization = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const org = await this.orgService.getMyOrganization(req.user.id, req.user.organizationId);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });
    getOrganization = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const org = await this.orgService.getOrganization(req.params.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });
    getAllOrganizations = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const orgs = await this.orgService.getAllOrganizations();
        res.status(200).json({ status: 'success', data: { organizations: orgs } });
    });
}
exports.OrganizationsController = OrganizationsController;
