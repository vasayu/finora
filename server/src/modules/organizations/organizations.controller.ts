import { Request, Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const createOrgSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
});

const joinOrgSchema = z.object({
    inviteCode: z.string().min(1, 'Invite code is required'),
});

export class OrganizationsController {
    private orgService: OrganizationsService;

    constructor() {
        this.orgService = new OrganizationsService();
    }

    createOrganization = catchAsync(async (req: Request, res: Response) => {
        const { name } = createOrgSchema.parse(req.body);

        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }

        const org = await this.orgService.createOrganization(name, req.user.id);
        res.status(201).json({ status: 'success', data: { organization: org } });
    });

    joinOrganization = catchAsync(async (req: Request, res: Response) => {
        const { inviteCode } = joinOrgSchema.parse(req.body);

        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }

        const org = await this.orgService.joinOrganization(inviteCode, req.user.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getMyOrganization = catchAsync(async (req: Request, res: Response) => {
        const org = await this.orgService.getMyOrganization(req.user.id, req.user.organizationId);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getOrganization = catchAsync(async (req: Request, res: Response) => {
        const org = await this.orgService.getOrganization(req.params.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getAllOrganizations = catchAsync(async (req: Request, res: Response) => {
        const orgs = await this.orgService.getAllOrganizations();
        res.status(200).json({ status: 'success', data: { organizations: orgs } });
    });
}
