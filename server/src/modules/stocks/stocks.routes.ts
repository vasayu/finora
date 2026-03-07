// server/src/modules/stocks/stocks.routes.ts
import { Router } from 'express';
import { getHistory, getPrediction, getRealtime } from './stocks.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// Define stock trading terminal endpoints (protected by user auth)
router.use(protect);

router.get('/history', getHistory);
router.post('/predict', getPrediction);
router.get('/realtime', getRealtime);

export default router;
