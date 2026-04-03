import { Router } from 'express';
import { OrganizationsController } from './organizations.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
const orgController = new OrganizationsController();

router.use(protect);

// Any authenticated user can access these
router.get('/my-org', orgController.getMyOrganization);
router.get('/members', orgController.getOrganizationMembers);
router.post('/', orgController.createOrganization);
router.post('/join', orgController.joinOrganization);

// Get specific org by ID
router.get('/:id', orgController.getOrganization);

// Update/Leave specific org
router.put('/:id', orgController.updateOrganization);
router.delete('/leave', orgController.leaveOrganization);

export default router;
