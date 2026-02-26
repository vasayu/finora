import { Request, Response } from 'express';
import { TransactionsService } from './transactions.service';
import { catchAsync } from '../../utils/catchAsync';

export class TransactionsController {
    private txService: TransactionsService;

    constructor() {
        this.txService = new TransactionsService();
    }

    createTransaction = catchAsync(async (req: Request, res: Response) => {
        const transaction = await this.txService.createTransaction(req.user.id, req.body);
        res.status(201).json({ status: 'success', data: { transaction } });
    });

    getTransactions = catchAsync(async (req: Request, res: Response) => {
        const { organizationId } = req.query;
        const userId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
        const transactions = await this.txService.getTransactions(organizationId as string, userId);
        res.status(200).json({ status: 'success', data: { transactions } });
    });
}
