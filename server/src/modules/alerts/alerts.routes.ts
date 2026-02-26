import { Router } from 'express';
import { AlertsController } from './alerts.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const alertsController = new AlertsController();

router.use(protect);

router.get('/', alertsController.getAlerts);
router.patch('/:id/read', alertsController.markAsRead);

export default router;
