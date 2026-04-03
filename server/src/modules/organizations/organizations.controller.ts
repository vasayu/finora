import { Request, Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const createOrgSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    domain: z.string().min(3, 'Organization domain must be at least 3 characters'),
    role: z.enum(['CFO', 'MANAGER', 'EMPLOYEE']),
    position: z.string().min(1, 'Position is required'),
    revenueRange: z.string().optional(),
    fundingStage: z.string().optional(),
    companyType: z.string().optional(),
    stockTicker: z.string().optional(),
    headquarters: z.string().optional(),
    size: z.string().optional(),
    linkedinUrl: z.string().optional(),
});

const joinOrgSchema = z.object({
    domain: z.string().min(3, 'Domain is required'),
    role: z.enum(['CFO', 'MANAGER', 'EMPLOYEE']),
    position: z.string().min(1, 'Position is required'),
});

const updateOrgSchema = z.object({
    name: z.string().min(2).optional(),
    revenueRange: z.string().optional(),
    fundingStage: z.string().optional(),
    companyType: z.string().optional(),
    stockTicker: z.string().optional(),
    headquarters: z.string().optional(),
    size: z.string().optional(),
    linkedinUrl: z.string().optional(),
}).transform((data) => {
    // Convert empty strings to null so Prisma clears the field instead of storing ""
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        cleaned[key] = value === '' ? null : value;
    }
    return cleaned;
});

export class OrganizationsController {
    private orgService: OrganizationsService;

    constructor() {
        this.orgService = new OrganizationsService();
    }

    createOrganization = catchAsync(async (req: Request, res: Response) => {
        const { name, domain, role, position, revenueRange, fundingStage, companyType, stockTicker, headquarters, size, linkedinUrl } = createOrgSchema.parse(req.body);

        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }

        const org = await this.orgService.createOrganization(
            name, domain, role, position, req.user.id, 
            { revenueRange, fundingStage, companyType, stockTicker, headquarters, size, linkedinUrl }
        );
        res.status(201).json({ status: 'success', data: { organization: org } });
    });

    joinOrganization = catchAsync(async (req: Request, res: Response) => {
        const { domain, role, position } = joinOrgSchema.parse(req.body);

        if (req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are already part of an organization' });
        }

        const org = await this.orgService.joinOrganization(domain, role, position, req.user.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getMyOrganization = catchAsync(async (req: Request, res: Response) => {
        const org = await this.orgService.getMyOrganization(req.user.id, req.user.organizationId);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getOrganizationMembers = catchAsync(async (req: Request, res: Response) => {
        if (!req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are not part of an organization' });
        }
        const members = await this.orgService.getOrganizationMembers(req.user.organizationId);
        res.status(200).json({ status: 'success', data: members });
    });

    getOrganization = catchAsync(async (req: Request, res: Response) => {
        const org = await this.orgService.getOrganization(req.params.id);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    getAllOrganizations = catchAsync(async (req: Request, res: Response) => {
        const orgs = await this.orgService.getAllOrganizations();
        res.status(200).json({ status: 'success', data: { organizations: orgs } });
    });

    updateOrganization = catchAsync(async (req: Request, res: Response) => {
        const orgId = req.params.id;
        if (!orgId) return res.status(400).json({ status: 'fail', message: 'Organization ID is required' });

        const data = updateOrgSchema.parse(req.body);
        const org = await this.orgService.updateOrganization(orgId, data);
        res.status(200).json({ status: 'success', data: { organization: org } });
    });

    leaveOrganization = catchAsync(async (req: Request, res: Response) => {
        if (!req.user.organizationId) {
            return res.status(400).json({ status: 'fail', message: 'You are not part of an organization' });
        }
        await this.orgService.leaveOrganization(req.user.id, req.user.organizationId);
        res.status(200).json({ status: 'success', message: 'Successfully left the organization' });
    });
}
