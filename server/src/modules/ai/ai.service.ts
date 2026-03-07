import { openai } from '../../config/openai';
import { prisma } from '../../config/database';
import logger from '../../utils/logger';

export class AIService {
    /**
     * Analyze financial data using OpenAI based on a user query.
     * Fetches the user's financial context from the database, builds a prompt, and returns AI insights.
     */
    async analyzeFinancials(
        userId: string,
        query: string,
        context?: { startDate?: string; endDate?: string; category?: string }
    ) {
        // 1. Fetch user's financial data for context
        const where: any = { userId };
        if (context?.startDate && context?.endDate) {
            where.date = {
                gte: new Date(context.startDate),
                lte: new Date(context.endDate),
            };
        }
        if (context?.category) {
            where.category = context.category;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 100,
        });

        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        // 2. Compute summary stats
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryBreakdown: Record<string, number> = {};

        for (const tx of transactions) {
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') totalExpense += tx.amount;
            categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
        }

        const financialContext = {
            totalTransactions: transactions.length,
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            categoryBreakdown,
            activeAlerts: alerts.filter(a => !a.isRead).length,
            recentAlerts: alerts.slice(0, 5).map(a => ({ type: a.type, message: a.message })),
        };

        // 3. Build the OpenAI prompt
        const systemPrompt = `You are Finora AI, an expert financial intelligence assistant. You analyze financial data and provide actionable insights, risk assessments, and strategic recommendations. Always be specific, data-driven, and professional. Format your responses with clear sections and use numbers/percentages where applicable.`;

        const userPrompt = `
Here is the user's financial data summary:
- Total Transactions: ${financialContext.totalTransactions}
- Total Income: $${financialContext.totalIncome.toFixed(2)}
- Total Expenses: $${financialContext.totalExpense.toFixed(2)}
- Net Profit: $${financialContext.netProfit.toFixed(2)}
- Category Breakdown: ${JSON.stringify(financialContext.categoryBreakdown)}
- Active Alerts: ${financialContext.activeAlerts}
- Recent Alerts: ${JSON.stringify(financialContext.recentAlerts)}

User Query: ${query}

Provide a detailed financial analysis addressing the user's query based on this data.`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 1500,
            });

            const aiResponse = completion.choices[0]?.message?.content || 'Unable to generate analysis.';

            // 4. Log audit trail
            await prisma.auditTrail.create({
                data: {
                    action: 'AI_ANALYSIS',
                    entity: 'FinancialAnalysis',
                    entityId: userId,
                    userId,
                    details: { query, responseLength: aiResponse.length },
                },
            });

            return {
                query,
                analysis: aiResponse,
                dataContext: financialContext,
                generatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            logger.error('OpenAI analysis error:', error);
            throw { statusCode: 502, message: 'Failed to generate AI analysis. Please try again.' };
        }
    }

    /**
     * Interactive financial chat with conversation history.
     */
    async chat(
        userId: string,
        message: string,
        conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
    ) {
        // Fetch recent financial summary for context
        const recentTx = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 20,
        });

        let totalIncome = 0;
        let totalExpense = 0;
        for (const tx of recentTx) {
            if (tx.type === 'INCOME') totalIncome += tx.amount;
            if (tx.type === 'EXPENSE') totalExpense += tx.amount;
        }

        const systemPrompt = `You are Finora AI, a conversational financial assistant. You have access to the user's financial data. Be helpful, concise, and provide actionable advice. The user's recent financial snapshot: Income: $${totalIncome.toFixed(2)}, Expenses: $${totalExpense.toFixed(2)}, Net: $${(totalIncome - totalExpense).toFixed(2)}, Recent transactions: ${recentTx.length}.`;

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
        ];

        // Add conversation history
        if (conversationHistory) {
            for (const msg of conversationHistory) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        messages.push({ role: 'user', content: message });

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.8,
                max_tokens: 1000,
            });

            const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not process your request.';

            return {
                message: aiResponse,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            logger.error('OpenAI chat error:', error);
            throw { statusCode: 502, message: 'Failed to process chat. Please try again.' };
        }
    }
}
