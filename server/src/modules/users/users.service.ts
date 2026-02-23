import { UsersRepository } from './users.repository';
import { Prisma } from '@prisma/client';

export class UsersService {
    private repository: UsersRepository;

    constructor() {
        this.repository = new UsersRepository();
    }

    async getUser(id: string) {
        const user = await this.repository.findById(id);
        if (!user) throw { statusCode: 404, message: 'User not found' };
        return user;
    }

    async getAllUsers() {
        return this.repository.findAll();
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        return this.repository.update(id, data);
    }

    async deleteUser(id: string) {
        return this.repository.delete(id);
    }
}
