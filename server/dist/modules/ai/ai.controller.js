"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("./ai.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const analyzeSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    context: zod_1.z.object({
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
    }).optional(),
});
const chatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    conversationHistory: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
    })).optional(),
});
class AIController {
    aiService;
    constructor() {
        this.aiService = new ai_service_1.AIService();
    }
    analyze = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const validatedData = analyzeSchema.parse(req.body);
        const analysis = await this.aiService.analyzeFinancials(req.user.id, validatedData.query, validatedData.context);
        res.status(200).json({ status: 'success', data: { analysis } });
    });
    chat = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const validatedData = chatSchema.parse(req.body);
        const response = await this.aiService.chat(req.user.id, validatedData.message, validatedData.conversationHistory);
        res.status(200).json({ status: 'success', data: { response } });
    });
}
exports.AIController = AIController;
