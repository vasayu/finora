import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let { statusCode, message } = err;

    if (!statusCode) {
        statusCode = 500;
    }

    res.locals.errorMessage = err.message;

    if (process.env.NODE_ENV === 'development') {
        logger.error(err);
    }

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
