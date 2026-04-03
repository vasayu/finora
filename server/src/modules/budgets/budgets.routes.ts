import { Router } from 'express';
import { BudgetsController } from './budgets.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const budgetsController = new BudgetsController();

router.use(protect);

router.post('/', budgetsController.createBudget);
router.get('/', budgetsController.getBudgets);
router.delete('/:id', budgetsController.deleteBudget);

export default router;
