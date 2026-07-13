const PaymentService = require('../../services/customer/payment.service');

/**
 * Payment Controller - Shared (Public)
 * Handles webhook and status polling without auth
 */
class SharedPaymentController {
  /**
   * GET /api/payment/status/:orderCode
   */
  static async getPaymentStatus(req, res, next) {
    try {
      const { orderCode } = req.params;
      const result = await PaymentService.getPaymentStatus(orderCode);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/verify/:orderCode
   * Actively queries payOS to verify payment and update DB
   */
  static async verifyPayment(req, res, next) {
    try {
      const { orderCode } = req.params;
      const result = await PaymentService.verifyPayment(Number(orderCode));

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/webhook
   */
  static async handleWebhook(req, res) {
    try {
      // payOS sends webhook data in req.body
      const result = await PaymentService.handleWebhook(req.body);
      
      // payOS requires returning { success: true } if successful
      res.json({
        error: 0,
        message: 'Ok',
        data: null
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.json({
        error: 0, // Still return 0 so payOS doesn't retry infinitely if we fail to parse
        message: 'Error handling webhook',
        data: null
      });
    }
  }
}

module.exports = SharedPaymentController;
