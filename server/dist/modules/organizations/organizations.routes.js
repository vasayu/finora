"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizations_controller_1 = require("./organizations.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const orgController = new organizations_controller_1.OrganizationsController();
router.use(auth_middleware_1.protect);
// Any authenticated user can access these
router.get('/my-org', orgController.getMyOrganization);
router.post('/', orgController.createOrganization);
router.post('/join', orgController.joinOrganization);
// Get specific org by ID
router.get('/:id', orgController.getOrganization);
exports.default = router;
