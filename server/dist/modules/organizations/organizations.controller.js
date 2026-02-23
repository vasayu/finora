"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsController = void 0;
const organizations_service_1 = require("./organizations.service");
const catchAsync_1 = require("../../utils/catchAsync");
class OrganizationsController {
    orgService;
    constructor() {
        this.orgService = new organizations_service_1.OrganizationsService();
    }
    createOrganization = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const org = await this.orgService.createOrganization(req.body);
        res.status(201).json({ status: 'success', data: { organization: org } });
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
