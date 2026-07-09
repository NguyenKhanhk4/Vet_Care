const express = require('express');
const ClinicController = require('../../controllers/customer/clinic.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Customer Clinic Routes
 * Base path: /api/customer/clinics
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/clinics?search=keyword&page=1&limit=10
router.get('/', ClinicController.getAllClinics);

// GET /api/customer/clinics/:id
router.get('/:id', ClinicController.getClinicById);

module.exports = router;
