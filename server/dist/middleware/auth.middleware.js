"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const catchAsync_1 = require("../utils/catchAsync");
const database_1 = require("../config/database");
exports.protect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // ── Internal microservice bypass ──────────────────────────────
    const internalSecret = req.headers['x-internal-secret'];
    if (internalSecret && internalSecret === process.env.INTERNAL_SECRET) {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return next({ statusCode: 401, message: 'Internal request missing x-user-id header' });
        }
        const serviceUser = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!serviceUser) {
            return next({ statusCode: 401, message: 'User not found for internal request' });
        }
        req.user = serviceUser;
        return next();
    }
    // ── Standard JWT auth ─────────────────────────────────────────
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next({ statusCode: 401, message: 'Not authorized, no token' });
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const currentUser = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!currentUser) {
            return next({ statusCode: 401, message: 'The user belonging to this token no longer exists' });
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        return next({ statusCode: 401, message: 'Not authorized, token failed or expired' });
    }
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next({ statusCode: 403, message: 'You do not have permission to perform this action' });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
