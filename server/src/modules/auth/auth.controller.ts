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

const updateProfileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
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

    getMe = catchAsync(async (req: Request, res: Response) => {
        const user = await this.authService.getProfile(req.user.id);
        res.status(200).json({ status: 'success', data: { user } });
    });

    updateProfile = catchAsync(async (req: Request, res: Response) => {
        const validatedData = updateProfileSchema.parse(req.body);
        const user = await this.authService.updateProfile(req.user.id, validatedData);
        res.status(200).json({ status: 'success', data: { user } });
    });
}
