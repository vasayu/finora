"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Protected routes
router.get('/me', auth_middleware_1.protect, authController.getMe);
router.patch('/update-profile', auth_middleware_1.protect, authController.updateProfile);
exports.default = router;
