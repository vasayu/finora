import { Router } from 'express';
import { AIController } from './ai.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const aiController = new AIController();

router.use(protect);

router.post('/analyze', aiController.analyze);
router.post('/chat', aiController.chat);

export default router;
