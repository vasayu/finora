import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(protect);

router.get('/summary', dashboardController.getSummary);

export default router;
