const Payment = require('../../models/Payment');
const Appointment = require('../../models/Appointment');

/**
 * Payment Management Service - Admin
 * Handles viewing and confirming payments
 */
class AdminPaymentService {
  /**
   * Get all payments with pagination and filters
   * @param {Object} query - { page, limit, status, method }
   * @returns {Object} - { payments, pagination }
   */
  static async getAllPayments(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.method) {
      filter.method = query.method;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate({
          path: 'appointment',
          populate: [
            { path: 'service', select: 'name' },
            { path: 'clinic', select: 'name' },
          ],
        })
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment by ID
   * @param {string} paymentId
   * @returns {Object} payment
   */
  static async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'customer', select: 'name email phone' },
          { path: 'pet', select: 'name species breed' },
          { path: 'service', select: 'name price duration' },
          { path: 'clinic', select: 'name address' },
          {
            path: 'doctor',
            populate: { path: 'user', select: 'name' },
          },
        ],
      })
      .populate('customer', 'name email phone')
      .lean();

    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    return payment;
  }

  /**
   * Confirm cash payment
   * @param {string} paymentId
   * @returns {Object} updated payment
   */
  static async updatePayment(paymentId, updateData) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.status) {
      payment.status = updateData.status;
    }

    await payment.save();

    // If payment is confirmed, update appointment status to paid
    if (payment.status === 'completed') {
      await Appointment.findByIdAndUpdate(payment.appointment, { status: 'paid' });
    }

    return await Payment.findById(paymentId)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'service', select: 'name' },
          { path: 'clinic', select: 'name' },
        ],
      })
      .populate('customer', 'name email phone');
  }
}

module.exports = AdminPaymentService;
