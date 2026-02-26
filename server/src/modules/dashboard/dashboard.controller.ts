import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { catchAsync } from '../../utils/catchAsync';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    getSummary = catchAsync(async (req: Request, res: Response) => {
        const organizationId = req.query.organizationId as string | undefined;
        const summary = await this.dashboardService.getSummary(req.user.id, organizationId);
        res.status(200).json({ status: 'success', data: summary });
    });
}
