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
        const { organizationId, asOfDate } = req.query;
        const balanceSheet = await this.finService.getBalanceSheet(
            req.user.id,
            organizationId as string | undefined,
            asOfDate as string | undefined
        );
        res.status(200).json({ status: 'success', data: balanceSheet });
    });

    getBalanceSheetComparison = catchAsync(async (req: Request, res: Response) => {
        const { organizationId, asOfDate, prevDate } = req.query;
        const result = await this.finService.getBalanceSheetComparison(
            req.user.id,
            organizationId as string | undefined,
            asOfDate as string | undefined,
            prevDate as string | undefined
        );
        res.status(200).json({ status: 'success', data: result });
    });

    getAccountDrill = catchAsync(async (req: Request, res: Response) => {
        const { organizationId, asOfDate, account } = req.query;
        if (!account) {
            res.status(400).json({ status: 'error', message: 'account query param is required' });
            return;
        }
        const result = await this.finService.getAccountDrill(
            req.user.id,
            account as string,
            organizationId as string | undefined,
            asOfDate as string | undefined
        );
        res.status(200).json({ status: 'success', data: result });
    });

    exportBalanceSheet = catchAsync(async (req: Request, res: Response) => {
        const { organizationId, asOfDate } = req.query;
        const workbook = await this.finService.exportBalanceSheetExcel(
            req.user.id,
            organizationId as string | undefined,
            asOfDate as string | undefined
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=BalanceSheet_${new Date().toISOString().split('T')[0]}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    });
}
