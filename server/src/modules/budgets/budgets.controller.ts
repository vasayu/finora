import { Request, Response } from 'express';
import { BudgetsService } from './budgets.service';

const budgetsService = new BudgetsService();

export class BudgetsController {
    async createBudget(req: Request, res: Response) {
        try {
            const { name, amount, category, period, memberIds } = req.body;
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
                organizationId: organizationId || undefined,
                memberIds: Array.isArray(memberIds) ? memberIds : undefined
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

    async getBudget(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const organizationId = req.user?.organizationId;
            const { id } = req.params;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            const budget = await budgetsService.getBudgetAnalytics(id, userId, organizationId || undefined);
            res.json({ status: 'success', data: { budget } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
    async createSettlements(req: Request, res: Response) {
        try {
            let settlements = req.body;
            
            // Handle n8n raw string payloads if express didn't parse them due to missing headers
            if (typeof settlements === 'string') {
                try {
                    settlements = JSON.parse(settlements);
                } catch (e) {
                    // Ignore parse error, it'll fail the array check
                }
            }
            
            // Extract optional global properties
            let globalByUser: string | undefined;
            let globalCaption: string | undefined;

            // Handle n8n wrapping the array arbitrarily or via the new imageData structure
            if (settlements && Array.isArray(settlements) && settlements.length === 1 && settlements[0] && Array.isArray(settlements[0].imageData)) {
                globalByUser = settlements[0].byUser;
                globalCaption = settlements[0].caption;
                settlements = settlements[0].imageData;
            } else if (settlements && typeof settlements === 'object' && !Array.isArray(settlements)) {
                if (Array.isArray(settlements.imageData)) {
                    globalByUser = settlements.byUser;
                    globalCaption = settlements.caption;
                    settlements = settlements.imageData;
                }
                else if (Array.isArray(settlements.data)) settlements = settlements.data;
                else if (Array.isArray(settlements.body)) settlements = settlements.body;
                else if (Array.isArray(settlements.items)) settlements = settlements.items;
                // If they sent it as urlencoded and it ended up as a key
                else if (Object.keys(settlements).length === 1 && typeof Object.keys(settlements)[0] === 'string') {
                    try {
                        const parsedKey = JSON.parse(Object.keys(settlements)[0]);
                        if (Array.isArray(parsedKey)) settlements = parsedKey;
                    } catch(e) {}
                }
            }

            const userId = req.user?.id;
            const organizationId = req.user?.organizationId;

            if (!Array.isArray(settlements)) {
                console.log("Failed to parse settlement payload:", req.body);
                return res.status(400).json({ status: 'error', message: 'Payload must be an array of settlement objects. Make sure Content-Type is application/json' });
            }

            // Inject global byUser and caption into each item if they were provided at root level
            if (globalByUser || globalCaption) {
                settlements = settlements.map((item: any) => ({
                    ...item,
                    byUser: item.byUser || globalByUser,
                    caption: item.caption || globalCaption,
                    remarks: item.remarks || item.caption || globalCaption
                }));
            }

            // Extract budget name from caption string formatted exactly as "@Budget_name"
            let targetBudgetName: string | undefined;
            const rawCaption = globalCaption || (settlements[0] && settlements[0].caption);
            if (rawCaption && rawCaption.startsWith('@')) {
                 targetBudgetName = rawCaption.slice(1).replace(/_/g, ' ').trim();
            }
            console.log('[Settlement Webhook] caption:', rawCaption, '=> targetBudgetName:', targetBudgetName);
            console.log('[Settlement Webhook] userId:', userId, 'organizationId:', organizationId);
            console.log('[Settlement Webhook] settlements count:', settlements.length, 'byUser:', settlements[0]?.byUser);

            const result = await budgetsService.createSettlements(settlements, userId, organizationId || undefined, targetBudgetName);
            res.status(201).json({ status: 'success', data: { result } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateSettlementStatus(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { approved } = req.body;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            const settlement = await budgetsService.updateSettlementStatus(id, userId, approved);
            res.json({ status: 'success', data: { settlement } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async updateBudgetMembers(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { memberIds } = req.body;

            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }

            if (!Array.isArray(memberIds)) {
                return res.status(400).json({ status: 'error', message: 'memberIds must be an array' });
            }

            const budget = await budgetsService.updateBudgetMembers(id, memberIds, userId);
            res.json({ status: 'success', data: { budget } });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
