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
        const user = await this.repository.createUser({
            ...data,
            password: hashedPassword,
        });
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
}
exports.AuthService = AuthService;
