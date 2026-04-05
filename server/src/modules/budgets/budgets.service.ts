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
        memberIds?: string[];
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
                    ...(data.memberIds && data.memberIds.length > 0 && {
                        members: {
                            connect: data.memberIds.map(id => ({ id }))
                        }
                    })
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

            // For each budget, calculate how much was spent using the Settlement table
            const result = await Promise.all(
                budgets.map(async (budget: any) => {
                    const whereClause: any = {
                        budgetId: budget.id,
                        approved: true
                    };

                    const spentAgg = await prisma.settlement.aggregate({
                        _sum: { amount: true },
                        where: whereClause as any,
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
     * Get a single budget by ID and compute detailed member-level analytics
     */
    async getBudgetAnalytics(id: string, userId: string, organizationId?: string) {
        try {
            const budget = await prisma.budget.findFirst({
                where: {
                    id,
                    ...(organizationId ? { organizationId } : { userId, organizationId: null }),
                },
                include: {
                    members: true,
                } as any
            });

            if (!budget) throw new Error('Budget not found');

            // Find current month string
            const startOfMonth = new Date();
            const currentMonthStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}`;

            // Query settlements linked to THIS budget by budgetId directly — no org filter needed
            const spentAgg = await prisma.settlement.aggregate({
                _sum: { amount: true },
                where: {
                    budgetId: budget.id,
                    approved: true
                } as any,
            });
            const spent = (spentAgg._sum as any)?.amount || 0;
            const remaining = budget.amount - spent;
            const progressPercentage = Math.min((spent / budget.amount) * 100, 100);

            // Fetch ALL settlements linked to this budget (regardless of approval) so UI can render and toggle
            const settlementsInBudget = await prisma.settlement.findMany({
                where: {
                    budgetId: budget.id
                } as any,
                orderBy: { createdAt: 'desc' }
            });

            const structuredMembers = (budget as any).members.map((member: any) => {
                const memberFullName = `${member.firstName} ${member.lastName}`.toLowerCase();
                const memberEmail = member.email.toLowerCase();
                
                // Tie settlements to member if it physically matches userId OR string match
                const memberSettlements = settlementsInBudget.filter(s => {
                    if (s.userId === member.id) return true;
                    if (s.byUser) {
                        const byUserLower = s.byUser.toLowerCase();
                        if (byUserLower === memberFullName || byUserLower.includes(member.firstName.toLowerCase()) || byUserLower === memberEmail) {
                            return true;
                        }
                    }
                    return false;
                });

                // Calculate member spent based ONLY on approved transactions natively
                const memberSpent = memberSettlements.filter(s => s.approved).reduce((sum, current) => sum + current.amount, 0);

                return {
                    id: member.id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    role: member.role,
                    spent: memberSpent
                };
            });

            return {
                ...budget,
                spent,
                remaining,
                progressPercentage,
                analytics: {
                    members: structuredMembers,
                    settlements: settlementsInBudget // Expose to UI natively
                }
            };
        } catch (error: any) {
            logger.error(`Failed to fetch budget analytics: ${error.message}`);
            throw new Error('Failed to fetch budget analytics');
        }
    }

    /**
     * Delete a budget
     */
    async deleteBudget(id: string, userId: string) {
        try {
            const budget = await prisma.budget.findUnique({ 
                where: { id },
                include: { settlements: true } as any
            });
            if (!budget) throw new Error('Budget not found');
            if (budget.userId !== userId) throw new Error('Unauthorized'); // Basic protection

            const settlementIds = (budget as any).settlements.map((s: any) => s.id);

            // Run in a transaction to ensure atomic deletion of mirrored transactions, then the budget
            await prisma.$transaction([
                // Delete mirrored transactions linked to these settlements
                prisma.transaction.deleteMany({
                    where: {
                        settlementId: {
                            in: settlementIds
                        }
                    } as any
                }),
                // Delete the budget (which will cascade to delete the settlements via Prisma Schema)
                prisma.budget.delete({
                    where: { id }
                })
            ]);
            
            return true;
        } catch (error: any) {
            logger.error(`Failed to delete budget: ${error.message}`);
            throw new Error('Failed to delete budget');
        }
    }
    /**
     * Create multiple settlements from an array explicitly mapped to targetBudgetName
     */
    async createSettlements(settlements: any[], userId?: string, organizationId?: string, targetBudgetName?: string) {
        try {
            let matchedBudget: any = null;
            if (targetBudgetName) {
                // Search by name — if we have org context use it, otherwise search all budgets by name
                const budgetWhere: any = {
                    name: { equals: targetBudgetName, mode: 'insensitive' }
                };
                if (organizationId) {
                    budgetWhere.organizationId = organizationId;
                } else if (userId) {
                    budgetWhere.userId = userId;
                }
                // If neither userId nor organizationId, just search by name globally
                matchedBudget = await prisma.budget.findFirst({
                    where: budgetWhere,
                    include: { members: true } as any
                });
                logger.info(`Settlement webhook: searching budget "${targetBudgetName}" => ${matchedBudget ? `found id=${matchedBudget.id}` : 'NOT FOUND'}`);
            }

            // Inherit organizationId from the matched budget if we don't have one from auth
            const effectiveOrgId = organizationId || (matchedBudget ? matchedBudget.organizationId : null);

            const dataToInsert = settlements.map(s => {
                let mappedUserId = userId || null;
                
                // String match webhook byUser to budget member names
                if (matchedBudget && s.byUser) {
                    const lowUser = s.byUser.toLowerCase();
                    const boundMember = matchedBudget.members.find((m: any) => 
                        lowUser === `${m.firstName} ${m.lastName}`.toLowerCase() ||
                        lowUser.includes(m.firstName.toLowerCase()) ||
                        m.firstName.toLowerCase().includes(lowUser)
                    );
                    if (boundMember) {
                        mappedUserId = boundMember.id;
                        logger.info(`Settlement webhook: matched byUser "${s.byUser}" => member ${boundMember.firstName} ${boundMember.lastName} (${boundMember.id})`);
                    }
                }

                const rawCategory = (s.category || "Other").trim();
                const normalizedCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();

                return {
                    amount: typeof s.amount === 'string' ? parseFloat(s.amount) : s.amount,
                    byUser: s.byUser,
                    category: normalizedCategory,
                    remarks: s.remarks || null,
                    towards: s.towards || null,
                    date: s.date || new Date().toISOString().split('T')[0],
                    time: s.time || '00:00:00',
                    approved: s.approved === undefined ? true : (s.approved === true || s.approved === 'true'),
                    userId: mappedUserId,
                    organizationId: effectiveOrgId,
                    budgetId: matchedBudget ? matchedBudget.id : null
                };
            });

            const result = await Promise.all(dataToInsert.map(async (data: any) => {
                const s = await prisma.settlement.create({ data });
                if (s.approved) {
                    await this.syncSettlementToTransaction(s.id);
                }
                return s;
            }));

            return { count: result.length };
        } catch (error: any) {
            logger.error(`Failed to create settlements: ${error.message}`);
            throw new Error('Failed to create settlements');
        }
    }

    /**
     * Helper to mirror an approved settlement as a permanent transaction
     */
    async syncSettlementToTransaction(settlementId: string) {
        try {
            const settlement = await prisma.settlement.findUnique({
                where: { id: settlementId }
            });

            if (!settlement) return;

            if (settlement.approved) {
                // Compile description from towards/remarks
                const description = [
                    settlement.towards ? `Payee: ${settlement.towards}` : null,
                    settlement.remarks ? `Note: ${settlement.remarks}` : null,
                    `Source: Budget Settlement (${settlement.byUser})`
                ].filter(Boolean).join(' | ');

                // Parse date/time strings to formal Date object if possible, else now
                let txDate: Date;
                try {
                    txDate = new Date(`${settlement.date}T${settlement.time}`);
                    if (isNaN(txDate.getTime())) throw new Error();
                } catch {
                    txDate = new Date();
                }

                // Mirrored transaction
                const txData: any = {
                    amount: settlement.amount,
                    currency: 'INR', // Defaulting to INR as per user's last request preference
                    type: 'EXPENSE' as const,
                    category: settlement.category || 'Other',
                    date: txDate,
                    description,
                    userId: settlement.userId || (await prisma.user.findFirst({ where: { organizationId: settlement.organizationId } }))?.id, // Fallback to first user in org if unknown
                    organizationId: settlement.organizationId,
                    settlementId: settlement.id
                };

                // Filter out null userId if we really can't find one
                if (!txData.userId) delete txData.userId;

                const tx = await prisma.transaction.upsert({
                    where: { settlementId: settlement.id },
                    create: txData,
                    update: txData
                });

                // Update settlement with the link
                await prisma.settlement.update({
                    where: { id: settlement.id },
                    data: { transactionId: tx.id }
                });
            } else {
                // If disapproved, remove the mirrored transaction if it exists
                const tx = await prisma.transaction.findUnique({
                    where: { settlementId: settlement.id }
                });

                if (tx) {
                    await prisma.transaction.delete({ where: { id: tx.id } });
                    await prisma.settlement.update({
                        where: { id: settlement.id },
                        data: { transactionId: null }
                    });
                }
            }
        } catch (error: any) {
            logger.error(`Failed to sync settlement to transaction: ${error.message}`);
        }
    }

    /**
     * Update Settlement Approved status explicitly
     */
    async updateSettlementStatus(id: string, userId: string, approved: boolean) {
        try {
            const settlement = await prisma.settlement.update({
                where: { id },
                data: { approved }
            });
            
            // Sync mirroring
            await this.syncSettlementToTransaction(id);
            
            // Create an alert for the user if their settlement was disapproved
            if (!approved && settlement.userId) {
                await prisma.alert.create({
                    data: {
                        type: 'SETTLEMENT_DISAPPROVED',
                        message: `Your settlement of ₹${settlement.amount} towards ${settlement.towards || settlement.category || 'expense'} has been disapproved.`,
                        userId: settlement.userId
                    }
                });
            }
            
            return settlement;
        } catch (error: any) {
            logger.error(`Failed to update settlement status: ${error.message}`);
            throw new Error('Failed to update settlement status');
        }
    }
    /**
     * Update budget members
     */
    async updateBudgetMembers(id: string, memberIds: string[], userId: string) {
        try {
            const budget = await prisma.budget.findUnique({ 
                where: { id },
                include: { members: true } as any
             });
            
            if (!budget) throw new Error('Budget not found');
            
            const updatedBudget = await prisma.budget.update({
                where: { id },
                data: {
                    members: {
                        set: memberIds.map(id => ({ id }))
                    }
                } as any,
                include: { members: true } as any
            });
            
            return updatedBudget;
        } catch (error: any) {
            logger.error(`Failed to update budget members: ${error.message}`);
            throw new Error('Failed to update budget members');
        }
    }
}
