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

// POST /api/customer/payments
router.post(
  '/',
  [
    body('appointmentId')
      .notEmpty().withMessage('Appointment ID is required')
      .isMongoId().withMessage('Invalid appointment ID'),
    body('method')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['vnpay', 'momo', 'cash']).withMessage('Invalid payment method. Must be vnpay, momo, or cash'),
  ],
  validate,
  PaymentController.processPayment
);

// GET /api/customer/payments?page=1&limit=10
router.get('/', PaymentController.getPaymentHistory);

module.exports = router;
