const Review = require('../../models/Review');

/**
 * Review Management Service - Admin
 * Handles viewing and deleting reviews
 */
class AdminReviewService {
  /**
   * Get all reviews with pagination
   * @param {Object} query - { page, limit }
   * @returns {Object} - { reviews, pagination }
   */
  static async getAllReviews(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('customer', 'name email avatar')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' },
        })
        .populate('clinic', 'name')
        .populate('appointment', 'date time')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a review (violation)
   * @param {string} reviewId
   */
  static async deleteReview(reviewId) {
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Review deleted successfully' };
  }
}

module.exports = AdminReviewService;
