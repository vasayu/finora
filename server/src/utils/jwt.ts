import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateTokens = (userId: string, role: string) => {
    const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
