const express = require('express');
const { body } = require('express-validator');
const PaymentController = require('../../controllers/customer/payment.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Payment Routes
 * Base path: /api/customer/payments
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// POST /api/customer/payments/create
router.post(
  '/create',
  [
    body('appointmentId')
      .notEmpty().withMessage('Appointment ID is required')
      .isMongoId().withMessage('Invalid appointment ID')
  ],
  validate,
  PaymentController.createPayment
);

// GET /api/customer/payments/history
router.get('/history', PaymentController.getPaymentHistory);

// GET /api/customer/payments/:id
router.get('/:id', PaymentController.getPaymentById);

module.exports = router;
