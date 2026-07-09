const express = require('express');
const router = express.Router();
const AdminAppointmentController = require('../../controllers/admin/appointment.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Appointment Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminAppointmentController.getAllAppointments);
router.get('/:id', AdminAppointmentController.getAppointmentById);
router.put('/:id', AdminAppointmentController.updateAppointment);
router.delete('/:id', AdminAppointmentController.deleteAppointment);

module.exports = router;
