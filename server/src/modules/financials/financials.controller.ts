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
        const pnl = await this.finService.getPnL(
            req.user.id,
            organizationId as string | undefined,
            startDate as string | undefined,
            endDate as string | undefined
        );
        res.status(200).json({ status: 'success', data: pnl });
    });

    getBalanceSheet = catchAsync(async (req: Request, res: Response) => {
        const { organizationId } = req.query;
        const balanceSheet = await this.finService.getBalanceSheet(
            req.user.id,
            organizationId as string | undefined
        );
        res.status(200).json({ status: 'success', data: balanceSheet });
    });
}
