import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { catchAsync } from '../../utils/catchAsync';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    getSummary = catchAsync(async (req: Request, res: Response) => {
        const { organizationId } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }

        const summary = await this.dashboardService.getSummary(organizationId as string, req.user.id);
        res.status(200).json({ status: 'success', data: { summary } });
    });
}
