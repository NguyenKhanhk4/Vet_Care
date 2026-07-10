const express = require('express');
const { body } = require('express-validator');
const AppointmentController = require('../../controllers/customer/appointment.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Appointment Routes
 * Base path: /api/customer/appointments
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/appointments?status=pending&page=1&limit=10
router.get('/', AppointmentController.getAllAppointments);

// GET /api/customer/appointments/booked-times
router.get('/booked-times', AppointmentController.getBookedTimes);

// GET /api/customer/appointments/:id
router.get('/:id', AppointmentController.getAppointmentById);

// POST /api/customer/appointments
router.post(
  '/',
  [
    body('pet').notEmpty().withMessage('Pet is required').isMongoId().withMessage('Invalid pet ID'),
    body('clinic').notEmpty().withMessage('Clinic is required').isMongoId().withMessage('Invalid clinic ID'),
    body('doctor').notEmpty().withMessage('Doctor is required').isMongoId().withMessage('Invalid doctor ID'),
    body('service').notEmpty().withMessage('Service is required').isMongoId().withMessage('Invalid service ID'),
    body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
    body('time')
      .notEmpty().withMessage('Time is required')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:mm format'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],
  validate,
  AppointmentController.createAppointment
);

// PUT /api/customer/appointments/:id
router.put(
  '/:id',
  [
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('time')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:mm format'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],
  validate,
  AppointmentController.updateAppointment
);

// DELETE /api/customer/appointments/:id
router.delete('/:id', AppointmentController.cancelAppointment);

module.exports = router;
