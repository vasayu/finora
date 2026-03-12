import { Router } from 'express';
import { FinancialsController } from './financials.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const finController = new FinancialsController();

router.use(protect);

router.get('/pnl', finController.getPnL);
router.get('/balance-sheet', finController.getBalanceSheet);
router.get('/balance-sheet/export', finController.exportBalanceSheet);

export default router;
