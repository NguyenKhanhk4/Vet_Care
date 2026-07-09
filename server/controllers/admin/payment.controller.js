const AdminPaymentService = require('../../services/admin/payment.service');

/**
 * Payment Management Controller - Admin
 */
class AdminPaymentController {
  /**
   * GET /api/admin/payments
   */
  static async getAllPayments(req, res, next) {
    try {
      const result = await AdminPaymentService.getAllPayments(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/payments/:id
   */
  static async getPaymentById(req, res, next) {
    try {
      const payment = await AdminPaymentService.getPaymentById(req.params.id);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/payments/:id
   */
  static async updatePayment(req, res, next) {
    try {
      const payment = await AdminPaymentService.updatePayment(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminPaymentController;
