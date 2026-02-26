import { Request, Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { catchAsync } from '../../utils/catchAsync';

export class OrganizationsController {
    private orgService: OrganizationsService;

    constructor() {
        this.orgService = new OrganizationsService();
    }

    createOrganization = catchAsync(async (req: Request, res: Response) => {
        const org = await this.orgService.createOrganization(req.body);
        res.status(201).json({ status: 'success', data: { organization: org } });
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
