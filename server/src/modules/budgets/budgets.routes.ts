import { Router } from 'express';
import express from 'express';
import { BudgetsController } from './budgets.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const budgetsController = new BudgetsController();

// Webhook route from n8n (Bypasses JWT auth)
// We add express.json({ type: '*/*' }) to forcefully parse any body type n8n sends (even if headers are missing)
router.post('/settlement', express.json({ type: 'application/json' }), budgetsController.createSettlements);

router.use(protect);
router.post('/', budgetsController.createBudget);
router.patch('/:id/members', budgetsController.updateBudgetMembers);
router.put('/settlement/:id', budgetsController.updateSettlementStatus);
router.get('/', budgetsController.getBudgets);
router.get('/:id', budgetsController.getBudget);
router.delete('/:id', budgetsController.deleteBudget);

export default router;
