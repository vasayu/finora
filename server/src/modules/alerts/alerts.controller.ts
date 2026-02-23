import { Request, Response } from 'express';
import { AlertsService } from './alerts.service';
import { catchAsync } from '../../utils/catchAsync';

export class AlertsController {
    private alertsService: AlertsService;

    constructor() {
        this.alertsService = new AlertsService();
    }

    getAlerts = catchAsync(async (req: Request, res: Response) => {
        const alerts = await this.alertsService.getAlerts(req.user.id);
        res.status(200).json({ status: 'success', data: { alerts } });
    });

    markAsRead = catchAsync(async (req: Request, res: Response) => {
        const alert = await this.alertsService.markAsRead(req.params.id);
        res.status(200).json({ status: 'success', data: { alert } });
    });
}
