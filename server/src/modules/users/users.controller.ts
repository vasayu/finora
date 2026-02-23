import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { catchAsync } from '../../utils/catchAsync';

export class UsersController {
    private usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
    }

    getMe = catchAsync(async (req: Request, res: Response) => {
        // req.user is populated by protect middleware
        const user = await this.usersService.getUser(req.user.id);
        res.status(200).json({ status: 'success', data: { user } });
    });

    getUser = catchAsync(async (req: Request, res: Response) => {
        const user = await this.usersService.getUser(req.params.id);
        res.status(200).json({ status: 'success', data: { user } });
    });

    getAllUsers = catchAsync(async (req: Request, res: Response) => {
        const users = await this.usersService.getAllUsers();
        res.status(200).json({ status: 'success', data: { users } });
    });
}
