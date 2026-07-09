const Review = require('../../models/Review');
const Appointment = require('../../models/Appointment');
const Doctor = require('../../models/Doctor');
const Clinic = require('../../models/Clinic');

/**
 * Review Service - Customer
 * Handles review creation and retrieval
 * Constraint: One review per appointment
 */
class ReviewService {
  /**
   * Create a review for a completed appointment
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} reviewData - { appointmentId, rating, comment }
   * @returns {Object} - Created review
   */
  static async createReview(customerId, reviewData) {
    const { appointmentId, rating, comment } = reviewData;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: customerId,
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Only allow reviews for completed or paid appointments
    if (!['completed', 'paid'].includes(appointment.status)) {
      const error = new Error('Can only review completed appointments');
      error.statusCode = 400;
      throw error;
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      const error = new Error('You have already reviewed this appointment');
      error.statusCode = 400;
      throw error;
    }

    // Create review
    const review = await Review.create({
      appointment: appointmentId,
      customer: customerId,
      doctor: appointment.doctor,
      clinic: appointment.clinic,
      rating,
      comment: comment || '',
    });

    // Update doctor's average rating
    const doctorReviews = await Review.find({ doctor: appointment.doctor });
    const avgRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length;
    await Doctor.findByIdAndUpdate(appointment.doctor, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: doctorReviews.length,
    });

    // Update clinic's average rating
    const clinicReviews = await Review.find({ clinic: appointment.clinic });
    const clinicAvg = clinicReviews.reduce((sum, r) => sum + r.rating, 0) / clinicReviews.length;
    await Clinic.findByIdAndUpdate(appointment.clinic, {
      rating: Math.round(clinicAvg * 10) / 10,
      totalReviews: clinicReviews.length,
    });

    return review;
  }

  /**
   * Get all reviews by a customer
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} query - { page, limit }
   * @returns {Object} - { reviews, total, page, pages }
   */
  static async getMyReviews(customerId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = { customer: customerId };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'pet', select: 'name species' },
          { path: 'service', select: 'name' },
        ],
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('clinic', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = ReviewService;
