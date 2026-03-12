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
        const userId = req.user.role === 'CFO' ? undefined : req.user.id;
        const transactions = await this.txService.getTransactions(organizationId as string, userId);
        res.status(200).json({ status: 'success', data: { transactions } });
    });

    updateTransaction = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const transaction = await this.txService.updateTransaction(id, req.user.id, req.body);
        res.status(200).json({ status: 'success', data: { transaction } });
    });

    deleteTransaction = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.txService.deleteTransaction(id, req.user.id, req.user.role);
        res.status(204).json({ status: 'success', data: null });
    });

    downloadTemplate = catchAsync(async (req: Request, res: Response) => {
        const workbook = await this.txService.generateTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Finora_Transactions_Template.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    });

    importTransactions = catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No Excel file uploaded' });
        }
        const { organizationId } = req.body;
        const stats = await this.txService.importTransactions(req.user.id, req.file.buffer, organizationId);
        res.status(200).json({ status: 'success', data: stats });
    });
}
