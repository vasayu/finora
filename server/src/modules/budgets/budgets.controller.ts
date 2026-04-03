import { Request, Response } from 'express';
import { BudgetsService } from './budgets.service';

const budgetsService = new BudgetsService();

export class BudgetsController {
    async createBudget(req: Request, res: Response) {
        try {
            const { name, amount, category, period } = req.body;
            const userId = req.user?.id;
            const organizationId = req.user?.organizationId;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            if (!name || !amount) {
                return res.status(400).json({ status: 'error', message: 'Name and amount are required' });
            }

            const budget = await budgetsService.createBudget({
                name,
                amount: parseFloat(amount),
                category,
                period,
                userId,
                organizationId: organizationId || undefined
            });

            res.status(201).json({ status: 'success', data: { budget } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getBudgets(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const organizationId = req.user?.organizationId;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            const budgets = await budgetsService.getBudgets(userId, organizationId || undefined);
            res.json({ status: 'success', data: { budgets } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async deleteBudget(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            await budgetsService.deleteBudget(id, userId);
            res.json({ status: 'success', message: 'Budget deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
