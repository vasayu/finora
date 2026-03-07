import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { catchAsync } from '../utils/catchAsync';
import { prisma } from '../config/database';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next({ statusCode: 401, message: 'Not authorized, no token' });
    }

    try {
        const decoded: any = verifyAccessToken(token);

        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!currentUser) {
            return next({ statusCode: 401, message: 'The user belonging to this token no longer exists' });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return next({ statusCode: 401, message: 'Not authorized, token failed or expired' });
    }
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next({ statusCode: 403, message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
