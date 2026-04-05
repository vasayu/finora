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
            activeAlerts: alerts.filter((a: any) => !a.isRead).length,
            recentAlerts: alerts.slice(0, 5).map((a: any) => ({ type: a.type, message: a.message })),
        };

        // 3. Build the "God-Level" 2-Shot Prompt
        const systemPrompt = `You are Finora AI, the world's most advanced financial intelligence engine. Your purpose is to deliver "Visual-First" elite analysis.
You excel at transforming raw transaction data into high-fidelity, actionable reports using tables, charts, and Mermaid diagrams.

### CORE OPERATING PRINCIPLES:
1. **Visual-First**: Never use text when a table or chart can explain it better.
2. **Actionable Intelligence**: Every insight must suggest a clear "Next Step" or optimization.
3. **High Density**: Responses must be lengthy, detailed, and extremely professional.

### FORMATTING PROTOCOLS:
- **TABLES**: Use Markdown tables for all data comparisons (e.g., Budget vs Actual, Top Expenses).
- **CHARTS**: Use the custom json block for visualization:
  \`\`\`chart
  {
    "type": "bar" | "pie" | "area",
    "data": [{ "name": "Category", "value": 1234 }]
  }
  \`\`\`
- **WORKFLOWS**: Use GitHub Mermaid syntax for strategic roadmaps:
  \`\`\`mermaid
  graph TD;
    A[Analyze] --> B[Optimize];
  \`\`\`

### EXAMPLE 1 (SHOT 1: SPENDING ANALYSIS):
User provides: Category breakdown with high dining costs.
Response:
"## 📊 Executive Spending Delta
| Category | Amount | % of Total | Status |
| :--- | :--- | :--- | :--- |
| Dining | $1,200 | 45% | 🛑 CRITICAL |
...
\`\`\`chart
{ "type": "pie", "data": [{"name": "Dining", "value": 1200}, ...] }
\`\`\`
\`\`\`mermaid
graph TD;
  A[Dining Expense] --> B{Strategy};
  B --> C[Limit to 2x/week];
  B --> D[Subscription Cleanup];
\`\`\`"

### EXAMPLE 2 (SHOT 2: INCOME GROWTH):
User provides: Net profit data.
Response:
"## 📈 Growth Performance Matrix
| Metric | Value | benchmark |
| :--- | :--- | :--- |
| Savings Rate | 15% | 🎯 Target: 20% |
...
\`\`\`chart
{ "type": "area", "data": [{"name": "Jan", "value": 500}, ...] }
\`\`\`"

Always maintain this "Elite Visual" standard.`;

        const userPrompt = `
Generate a MASTER-LEVEL FINANCIAL INTELLIGENCE REPORT based on the following context.
Be verbose, analytical, and extremely visual. Use at least 2 charts, 1 table, and 1 Mermaid diagram.

### DATA CONTEXT:
- **Snapshot**: ${financialContext.totalTransactions} transactions | Net Profit: $${financialContext.netProfit.toFixed(2)}
- **Categorical Delta**: ${JSON.stringify(financialContext.categoryBreakdown)}
- **Governance Alerts**: ${JSON.stringify(financialContext.recentAlerts)}

### USER QUERY:
"${query}"

### REPORT REQUIREMENTS:
1. Executive Summary: Bullet points with bold high-impact metrics.
2. Market Efficiency: Markdown table of top spending categories vs budget targets.
3. Visual Delta: JSON chart blocks for Income vs Expense and Category weights.
4. Strategic Roadmap: Mermaid workflow for optimizing the current financial trajectory.
5. Recommendation: One "God-Level" financial move the user should make today.`;


        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 3000,
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
                model: 'gpt-4o',
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
