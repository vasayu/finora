"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const usersController = new users_controller_1.UsersController();
router.use(auth_middleware_1.protect);
router.get('/me', usersController.getMe);
// Admin only routes
router.use((0, auth_middleware_1.restrictTo)('ADMIN', 'SUPER_ADMIN'));
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUser);
exports.default = router;
