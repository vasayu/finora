import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { generateTokens } from '../../utils/jwt';
import { Role } from '@prisma/client';

interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role?: Role;
}

export class AuthService {
    private repository: AuthRepository;

    constructor() {
        this.repository = new AuthRepository();
    }

    async register(data: RegisterInput) {
        const existingUser = await this.repository.findUserByEmail(data.email);
        if (existingUser) {
            throw { statusCode: 400, message: 'Email already in use' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const role = data.role || 'EMPLOYEE';

        const user = await this.repository.createUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            role,
        });

        // Create the role-specific profile
        await this.repository.createRoleProfile(user.id, role);

        const tokens = generateTokens(user.id, user.role);

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

    async login(email: string, password: string) {
        const user = await this.repository.findUserByEmail(email);
        if (!user) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }

        const tokens = generateTokens(user.id, user.role);

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

    async getProfile(userId: string) {
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

    async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }) {
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
