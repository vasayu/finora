import { Router } from 'express';
import { UsersController } from './users.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

router.use(protect);

router.get('/me', usersController.getMe);

// Admin only routes
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUser);

export default router;
