const express = require('express');
const MedicalRecordController = require('../../controllers/customer/medicalRecord.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Customer Medical Record Routes
 * Base path: /api/customer/medical-records
 * All routes require authentication - Read only
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/medical-records?petId=xxx&page=1&limit=10
router.get('/', MedicalRecordController.getAllRecords);

// GET /api/customer/medical-records/:id
router.get('/:id', MedicalRecordController.getRecordById);

module.exports = router;
