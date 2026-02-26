import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { protect } from '../../middleware/auth.middleware';
import { upload } from '../../utils/upload';

const router = Router();
const docsController = new DocumentsController();

router.use(protect);

router.post('/upload', upload.single('file'), docsController.uploadDocument);
router.get('/', docsController.getDocuments);
router.get('/:id', docsController.getDocument);

export default router;
