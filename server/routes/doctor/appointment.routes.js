const express = require('express');
const DoctorAppointmentController = require('../../controllers/doctor/appointment.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.get('/', DoctorAppointmentController.getAppointments);
router.get('/:id', DoctorAppointmentController.getAppointmentById);
router.put('/:id/confirm', DoctorAppointmentController.confirmAppointment);
router.put('/:id/reject', DoctorAppointmentController.rejectAppointment);
router.put('/:id/complete', DoctorAppointmentController.completeAppointment);

// const AppointmentController = require('../../controllers/doctor/appointment.controller');
// const { protect, authorize } = require('../../middlewares/auth.middleware');

// router.use(protect);
// router.use(authorize('doctor'));

// router.get('/', AppointmentController.getDoctorAppointments);
// router.put('/:id/status', AppointmentController.updateAppointmentStatus);

module.exports = router;
