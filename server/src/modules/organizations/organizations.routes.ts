import { Router } from 'express';
import { OrganizationsController } from './organizations.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = Router();
const orgController = new OrganizationsController();

router.use(protect);

router.get('/:id', orgController.getOrganization);

router.use(restrictTo('SUPER_ADMIN'));
router.post('/', orgController.createOrganization);
router.get('/', orgController.getAllOrganizations);

export default router;
