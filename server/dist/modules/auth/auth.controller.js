"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    role: zod_1.z.enum(['EMPLOYEE', 'ACCOUNTANT', 'CFO', 'MANAGER', 'INVESTOR']).default('EMPLOYEE'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
});
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    register = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const validatedData = registerSchema.parse(req.body);
        const result = await this.authService.register(validatedData);
        res.status(201).json({ status: 'success', data: result });
    });
    login = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const validatedData = loginSchema.parse(req.body);
        const result = await this.authService.login(validatedData.email, validatedData.password);
        res.status(200).json({ status: 'success', data: result });
    });
    getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await this.authService.getProfile(req.user.id);
        res.status(200).json({ status: 'success', data: { user } });
    });
    updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const validatedData = updateProfileSchema.parse(req.body);
        const user = await this.authService.updateProfile(req.user.id, validatedData);
        res.status(200).json({ status: 'success', data: { user } });
    });
}
exports.AuthController = AuthController;
