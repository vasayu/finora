"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_repository_1 = require("./auth.repository");
const jwt_1 = require("../../utils/jwt");
class AuthService {
    repository;
    constructor() {
        this.repository = new auth_repository_1.AuthRepository();
    }
    async register(data) {
        const existingUser = await this.repository.findUserByEmail(data.email);
        if (existingUser) {
            throw { statusCode: 400, message: 'Email already in use' };
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(data.password, salt);
        const role = data.role || 'EMPLOYEE';
        const user = await this.repository.createUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: hashedPassword,
            role,
        });
        // Create the role-specific profile
        await this.repository.createRoleProfile(user.id, role);
        const tokens = (0, jwt_1.generateTokens)(user.id, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            ...tokens,
        };
    }
    async login(email, password) {
        const user = await this.repository.findUserByEmail(email);
        if (!user) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }
        const tokens = (0, jwt_1.generateTokens)(user.id, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            ...tokens,
        };
    }
    async getProfile(userId) {
        const user = await this.repository.findUserById(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async updateProfile(userId, data) {
        if (data.email) {
            const existingUser = await this.repository.findUserByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw { statusCode: 400, message: 'Email already in use' };
            }
        }
        const user = await this.repository.updateUser(userId, data);
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.AuthService = AuthService;
