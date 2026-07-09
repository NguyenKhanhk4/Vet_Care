const AdminReviewService = require('../../services/admin/review.service');

/**
 * Review Management Controller - Admin
 */
class AdminReviewController {
  /**
   * GET /api/admin/reviews
   */
  static async getAllReviews(req, res, next) {
    try {
      const result = await AdminReviewService.getAllReviews(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/reviews/:id
   */
  static async deleteReview(req, res, next) {
    try {
      const result = await AdminReviewService.deleteReview(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminReviewController;
