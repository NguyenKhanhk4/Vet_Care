const express = require('express');
const router = express.Router();
const AdminDoctorController = require('../../controllers/admin/doctor.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Doctor Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminDoctorController.getAllDoctors);
router.get('/:id', AdminDoctorController.getDoctorById);
router.post('/', AdminDoctorController.createDoctor);
router.put('/:id', AdminDoctorController.updateDoctor);
router.delete('/:id', AdminDoctorController.deleteDoctor);

module.exports = router;
