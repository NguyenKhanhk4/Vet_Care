const PaymentService = require('../../services/customer/payment.service');

/**
 * Payment Controller - Customer
 * Handles authenticated payment endpoints
 */
class PaymentController {
  /**
   * POST /api/customer/payments/create
   */
  static async createPayment(req, res, next) {
    try {
      const result = await PaymentService.createPayment(req.user._id, req.body);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/payments/history
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

  /**
   * GET /api/customer/payments/:id
   */
  static async getPaymentById(req, res, next) {
    try {
      const result = await PaymentService.getPaymentById(req.user._id, req.params.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
