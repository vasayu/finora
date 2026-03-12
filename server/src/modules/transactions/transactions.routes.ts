import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { protect } from '../../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const txController = new TransactionsController();

// Use memory storage for Excel parsing
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get('/import/template', txController.downloadTemplate);
router.post('/import/upload', upload.single('file'), txController.importTransactions);

router.post('/', txController.createTransaction);
router.get('/', txController.getTransactions);
router.put('/:id', txController.updateTransaction);
router.delete('/:id', txController.deleteTransaction);

export default router;
