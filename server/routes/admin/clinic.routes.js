const express = require('express');
const router = express.Router();
const AdminClinicController = require('../../controllers/admin/clinic.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Clinic Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminClinicController.getAllClinics);
router.get('/:id', AdminClinicController.getClinicById);
router.post('/', AdminClinicController.createClinic);
router.put('/:id', AdminClinicController.updateClinic);
router.delete('/:id', AdminClinicController.deleteClinic);

module.exports = router;
