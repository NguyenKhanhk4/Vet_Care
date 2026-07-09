const express = require('express');
const router = express.Router();
const AdminPaymentController = require('../../controllers/admin/payment.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Payment Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminPaymentController.getAllPayments);
router.get('/:id', AdminPaymentController.getPaymentById);
router.put('/:id', AdminPaymentController.updatePayment);

module.exports = router;
