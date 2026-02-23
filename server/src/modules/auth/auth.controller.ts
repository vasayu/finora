import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = catchAsync(async (req: Request, res: Response) => {
        const validatedData = registerSchema.parse(req.body);
        const result = await this.authService.register(validatedData);
        res.status(201).json({ status: 'success', data: result });
    });

    login = catchAsync(async (req: Request, res: Response) => {
        const validatedData = loginSchema.parse(req.body);
        const result = await this.authService.login(validatedData.email, validatedData.password);
        res.status(200).json({ status: 'success', data: result });
    });
}
