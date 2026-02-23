import { Request, Response } from 'express';
import { FinancialsService } from './financials.service';
import { catchAsync } from '../../utils/catchAsync';

export class FinancialsController {
    private finService: FinancialsService;

    constructor() {
        this.finService = new FinancialsService();
    }

    getPnL = catchAsync(async (req: Request, res: Response) => {
        const { organizationId, startDate, endDate } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }

        const pnl = await this.finService.getPnL(
            organizationId as string,
            startDate as string,
            endDate as string
        );
        res.status(200).json({ status: 'success', data: { pnl } });
    });

    getBalanceSheet = catchAsync(async (req: Request, res: Response) => {
        const { organizationId } = req.query;
        if (!organizationId) {
            throw { statusCode: 400, message: 'organizationId is required' };
        }

        const balanceSheet = await this.finService.getBalanceSheet(organizationId as string);
        res.status(200).json({ status: 'success', data: { balanceSheet } });
    });
}
