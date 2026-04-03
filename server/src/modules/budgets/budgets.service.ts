import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

export class BudgetsService {
    /**
     * Create a new budget
     */
    async createBudget(data: {
        name: string;
        amount: number;
        category?: string;
        period?: string;
        userId: string;
        organizationId?: string;
    }) {
        try {
            const budget = await prisma.budget.create({
                data: {
                    name: data.name,
                    amount: data.amount,
                    category: data.category,
                    period: data.period || 'MONTHLY',
                userId: data.userId,
                organizationId: data.organizationId || null,
                },
            });
            return budget;
        } catch (error: any) {
            logger.error(`Failed to create budget: ${error.message}`);
            throw new Error('Failed to create budget');
        }
    }

    /**
     * Get all budgets for an organization (or user) and calculate spent amounts
     */
    async getBudgets(userId: string, organizationId?: string) {
        try {
            // Find all budgets for this scope
            const budgets = await prisma.budget.findMany({
                where: organizationId ? { organizationId } : { userId, organizationId: null },
                orderBy: { createdAt: 'desc' },
            });

            // For each budget, calculate how much was spent
            // We'll calculate spent sum of all expenses in this budget's category (or all if category is empty)
            const result = await Promise.all(
                budgets.map(async (budget: any) => {
                    const whereClause: any = {
                        type: 'EXPENSE',
                        ...(organizationId ? { organizationId } : { userId, organizationId: null }),
                    };

                    if (budget.category) {
                        whereClause.category = budget.category;
                    }

                    // Calculate within the current month (assuming period basically implies current month for now)
                    const startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);

                    whereClause.date = { gte: startOfMonth };

                    const spentAgg = await prisma.transaction.aggregate({
                        _sum: { amount: true },
                        where: whereClause,
                    });

                    const spent = spentAgg._sum.amount || 0;
                    const remaining = budget.amount - spent;

                    return {
                        ...budget,
                        spent,
                        remaining,
                        progressPercentage: Math.min((spent / budget.amount) * 100, 100),
                    };
                })
            );

            return result;
        } catch (error: any) {
            logger.error(`Failed to fetch budgets: ${error.message}`);
            throw new Error('Failed to fetch budgets');
        }
    }

    /**
     * Delete a budget
     */
    async deleteBudget(id: string, userId: string) {
        try {
            const budget = await prisma.budget.findUnique({ where: { id } });
            if (!budget) throw new Error('Budget not found');
            if (budget.userId !== userId) throw new Error('Unauthorized'); // Basic protection

            await prisma.budget.delete({
                where: { id }
            });
            return true;
        } catch (error: any) {
            logger.error(`Failed to delete budget: ${error.message}`);
            throw new Error('Failed to delete budget');
        }
    }
}
