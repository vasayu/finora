"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const catchAsync_1 = require("../../utils/catchAsync");
class UsersController {
    usersService;
    constructor() {
        this.usersService = new users_service_1.UsersService();
    }
    getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
        // req.user is populated by protect middleware
        const user = await this.usersService.getUser(req.user.id);
        res.status(200).json({ status: 'success', data: { user } });
    });
    getUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const user = await this.usersService.getUser(req.params.id);
        res.status(200).json({ status: 'success', data: { user } });
    });
    getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
        const users = await this.usersService.getAllUsers();
        res.status(200).json({ status: 'success', data: { users } });
    });
}
exports.UsersController = UsersController;
