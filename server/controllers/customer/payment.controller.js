const PaymentService = require('../../services/customer/payment.service');

/**
 * Payment Controller - Customer
 * Handles payment processing and history
 */
class PaymentController {
  /**
   * POST /api/customer/payments
   */
  static async processPayment(req, res, next) {
    try {
      const payment = await PaymentService.processPayment(req.user._id, req.body);

      res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/payments
   */
  static async getPaymentHistory(req, res, next) {
    try {
      const result = await PaymentService.getPaymentHistory(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.payments.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.payments,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
