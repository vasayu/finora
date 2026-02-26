import { Router } from 'express';
import { AuthController } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.patch('/update-profile', protect, authController.updateProfile);

export default router;
