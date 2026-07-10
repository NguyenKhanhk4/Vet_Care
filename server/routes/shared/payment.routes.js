const express = require('express');
const SharedPaymentController = require('../../controllers/shared/payment.controller');

const router = express.Router();

/**
 * Shared Payment Routes
 * Base path: /api/payment
 * Public routes (No authentication)
 */

router.get('/status/:orderCode', SharedPaymentController.getPaymentStatus);
router.post('/webhook', SharedPaymentController.handleWebhook);

module.exports = router;
