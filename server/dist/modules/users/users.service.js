"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const users_repository_1 = require("./users.repository");
class UsersService {
    repository;
    constructor() {
        this.repository = new users_repository_1.UsersRepository();
    }
    async getUser(id) {
        const user = await this.repository.findById(id);
        if (!user)
            throw { statusCode: 404, message: 'User not found' };
        return user;
    }
    async getAllUsers() {
        return this.repository.findAll();
    }
    async updateUser(id, data) {
        return this.repository.update(id, data);
    }
    async deleteUser(id) {
        return this.repository.delete(id);
    }
}
exports.UsersService = UsersService;
