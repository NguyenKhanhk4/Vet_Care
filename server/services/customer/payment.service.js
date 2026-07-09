const Payment = require('../../models/Payment');
const Appointment = require('../../models/Appointment');
const Notification = require('../../models/Notification');

/**
 * Payment Service - Customer
 * Handles payment processing (simulated) and payment history
 */
class PaymentService {
  /**
   * Process a payment for an appointment
   * Simulates VNPay, MoMo, or Cash payment
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} paymentData - { appointmentId, method }
   * @returns {Object} - Payment result
   */
  static async processPayment(customerId, paymentData) {
    const { appointmentId, method } = paymentData;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: customerId,
    }).populate('service', 'price name');

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if appointment can be paid
    if (appointment.status === 'paid') {
      const error = new Error('This appointment has already been paid');
      error.statusCode = 400;
      throw error;
    }

    if (appointment.status === 'cancelled') {
      const error = new Error('Cannot pay for a cancelled appointment');
      error.statusCode = 400;
      throw error;
    }

    // Check for existing completed payment
    const existingPayment = await Payment.findOne({
      appointment: appointmentId,
      status: 'completed',
    });

    if (existingPayment) {
      const error = new Error('Payment already completed for this appointment');
      error.statusCode = 400;
      throw error;
    }

    // Simulate payment processing
    const amount = appointment.totalAmount || appointment.service?.price || 0;

    // Create payment record
    const payment = await Payment.create({
      appointment: appointmentId,
      customer: customerId,
      amount,
      method,
      status: 'completed', // Simulated - always succeeds
    });

    // Update appointment status to paid
    appointment.status = 'paid';
    await appointment.save();

    // Create payment notification
    await Notification.create({
      user: customerId,
      title: 'Payment Successful',
      message: `Payment of ${amount.toLocaleString()}đ via ${method.toUpperCase()} has been completed`,
      type: 'payment',
      relatedId: payment._id,
    });

    return payment;
  }

  /**
   * Get payment history for a customer
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} query - { page, limit }
   * @returns {Object} - { payments, total, page, pages }
   */
  static async getPaymentHistory(customerId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = { customer: customerId };

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'pet', select: 'name species' },
          { path: 'service', select: 'name price' },
          { path: 'clinic', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = PaymentService;
