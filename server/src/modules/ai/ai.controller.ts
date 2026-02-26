import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const analyzeSchema = z.object({
    query: z.string().min(1),
    context: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        category: z.string().optional(),
    }).optional(),
});

const chatSchema = z.object({
    message: z.string().min(1),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).optional(),
});

export class AIController {
    private aiService: AIService;

    constructor() {
        this.aiService = new AIService();
    }

    analyze = catchAsync(async (req: Request, res: Response) => {
        const validatedData = analyzeSchema.parse(req.body);
        const analysis = await this.aiService.analyzeFinancials(
            req.user.id,
            validatedData.query,
            validatedData.context
        );
        res.status(200).json({ status: 'success', data: { analysis } });
    });

    chat = catchAsync(async (req: Request, res: Response) => {
        const validatedData = chatSchema.parse(req.body);
        const response = await this.aiService.chat(
            req.user.id,
            validatedData.message,
            validatedData.conversationHistory
        );
        res.status(200).json({ status: 'success', data: { response } });
    });
}
