const ReviewService = require('../../services/customer/review.service');

/**
 * Review Controller - Customer
 * Handles review creation and retrieval
 */
class ReviewController {
  /**
   * POST /api/customer/reviews
   */
  static async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user._id, req.body);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/reviews
   */
  static async getMyReviews(req, res, next) {
    try {
      const result = await ReviewService.getMyReviews(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.reviews.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
