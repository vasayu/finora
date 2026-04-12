import { Router } from 'express';
import { AIController } from './ai.controller';
import { ResearchController } from './research.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const aiController = new AIController();
const researchController = new ResearchController();

// Public research endpoint — no auth required (called server-to-server from Next.js)
router.post('/research', researchController.research);

router.use(protect);

router.post('/analyze', aiController.analyze);
router.post('/chat', aiController.chat);

export default router;
