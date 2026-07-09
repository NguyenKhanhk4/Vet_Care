const express = require('express');
const ServiceController = require('../../controllers/customer/service.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Customer Service Routes
 * Base path: /api/customer/services
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/services?clinicId=xxx&category=checkup&search=keyword&page=1&limit=10
router.get('/', ServiceController.getAllServices);

// GET /api/customer/services/:id
router.get('/:id', ServiceController.getServiceById);

module.exports = router;
