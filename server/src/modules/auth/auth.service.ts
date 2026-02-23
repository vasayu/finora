import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { generateTokens } from '../../utils/jwt';
import { Prisma } from '@prisma/client';

export class AuthService {
    private repository: AuthRepository;

    constructor() {
        this.repository = new AuthRepository();
    }

    async register(data: Prisma.UserCreateInput) {
        const existingUser = await this.repository.findUserByEmail(data.email);
        if (existingUser) {
            throw { statusCode: 400, message: 'Email already in use' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = await this.repository.createUser({
            ...data,
            password: hashedPassword,
        });

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
}
