import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const txController = new TransactionsController();

router.use(protect);

router.post('/', txController.createTransaction);
router.get('/', txController.getTransactions);

export default router;
