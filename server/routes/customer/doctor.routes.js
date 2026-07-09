const express = require('express');
const DoctorController = require('../../controllers/customer/doctor.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Customer Doctor Routes
 * Base path: /api/customer/doctors
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/doctors?clinicId=xxx&search=keyword&page=1&limit=10
router.get('/', DoctorController.getAllDoctors);

// GET /api/customer/doctors/:id
router.get('/:id', DoctorController.getDoctorById);

module.exports = router;
