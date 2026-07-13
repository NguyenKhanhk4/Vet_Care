const Payment = require('../../models/Payment');
const Appointment = require('../../models/Appointment');
const Notification = require('../../models/Notification');
const payos = require('../shared/payos.service');
const AdminNotificationService = require('../admin/admin-notification.service');

/**
 * Payment Service - Customer
 * Handles payOS payment processing
 */
class PaymentService {
  /**
   * Process a payment for an appointment using payOS
   * @param {string} userId - Customer's MongoDB ObjectId
   * @param {Object} paymentData - { appointmentId }
   * @returns {Object} - { checkoutUrl, orderCode }
   */
  static async createPayment(userId, paymentData) {
    const { appointmentId, method = 'payos' } = paymentData;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: userId,
    }).populate('services', 'price name');

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if appointment can be paid
    if (appointment.paymentStatus === 'PAID' || appointment.status === 'paid') {
      const error = new Error('This appointment has already been paid');
      error.statusCode = 400;
      throw error;
    }

    if (appointment.status === 'cancelled') {
      const error = new Error('Cannot pay for a cancelled appointment');
      error.statusCode = 400;
      throw error;
    }

    // Check for existing pending payment and maybe cancel it or reuse?
    // According to requirement, we create a new payment link.
    
    // Generate unique order code (must be Number for payOS)
    // Format: last 6 digits of timestamp + 3 random digits
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
    const amount = appointment.totalAmount || (appointment.services && appointment.services[0] && appointment.services[0].price) || 0;
    
    if (amount <= 0 && method === 'payos') {
      const error = new Error('Amount must be greater than 0 for online payment');
      error.statusCode = 400;
      throw error;
    }

    if (method === 'cash') {
      // For cash, we just record the payment intention and confirm the appointment
      const payment = await Payment.create({
        appointment: appointmentId,
        user: userId,
        orderCode,
        amount,
        description: 'Thanh toan tien mat',
        method: 'cash',
        status: 'PENDING'
      });

      // Update Appointment to pending, await doctor confirmation
      appointment.status = 'pending';
      // appointment.paymentStatus remains UNPAID until paid at clinic
      await appointment.save();

      return {
        method: 'cash',
        orderCode,
        success: true
      };
    }

    const description = `Thanh toan #${orderCode}`.substring(0, 25);

    const requestData = {
      orderCode,
      amount,
      description,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL
    };

    try {
      const paymentLinkRes = await payos.paymentRequests.create(requestData);

      // Save Payment to DB
      const payment = await Payment.create({
        appointment: appointmentId,
        user: userId,
        orderCode,
        paymentLinkId: paymentLinkRes.paymentLinkId,
        amount,
        description,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        status: 'PENDING'
      });

      return {
        checkoutUrl: paymentLinkRes.checkoutUrl,
        orderCode
      };
    } catch (error) {
      console.error('Error creating payOS payment link:', error);
      const errorMessage = error.desc || error.message || 'Failed to create payment link';
      const customError = new Error(errorMessage);
      customError.statusCode = 500;
      throw customError;
    }
  }

  /**
   * Get payment history for a customer
   * @param {string} userId - Customer's MongoDB ObjectId
   * @param {Object} query - { page, limit }
   * @returns {Object} - { payments, total, page, pages }
   */
  static async getPaymentHistory(userId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = { user: userId };

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'pet', select: 'name species' },
          { path: 'services', select: 'name price' },
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

  /**
   * Get payment by ID
   */
  static async getPaymentById(userId, paymentId) {
    const payment = await Payment.findOne({ _id: paymentId, user: userId })
      .populate('appointment');
      
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }
    
    return payment;
  }

  /**
   * Get payment status by orderCode
   */
  static async getPaymentStatus(orderCode) {
    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }
    return { status: payment.status };
  }

  /**
   * Verify payment status by querying payOS directly
   * Used as fallback when webhook can't reach localhost
   * @param {number} orderCode - payOS order code
   * @returns {Object} - { status, appointment }
   */
  static async verifyPayment(orderCode) {
    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    // Already resolved, just return current status
    if (payment.status === 'PAID') {
      return { status: 'PAID', alreadyProcessed: true };
    }

    // Query payOS for real transaction status
    try {
      const payosInfo = await payos.paymentRequests.get(orderCode);
      
      if (payosInfo.status === 'PAID') {
        // Update Payment
        payment.status = 'PAID';
        payment.paidAt = new Date();
        payment.transactionId = payosInfo.id || payosInfo.paymentLinkId;
        payment.rawResponse = payosInfo;
        await payment.save();

        // Update Appointment
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
          appointment.paymentStatus = 'PAID';
          appointment.status = 'confirmed';
          await appointment.save();

          // Send notification
          await Notification.create({
            user: payment.user,
            title: 'Payment Successful',
            message: `Thanh toán ${(payment.amount || 0).toLocaleString('vi-VN')}đ thành công. Lịch hẹn đã được xác nhận.`,
            type: 'payment',
            relatedId: payment._id,
          });

          await AdminNotificationService.notifyAdmins({
            actor: payment.user,
            title: 'Thanh toán thành công',
            message: `Khách hàng đã thanh toán ${(payment.amount || 0).toLocaleString('vi-VN')}đ cho lịch khám.`,
            type: 'payment',
            relatedId: payment._id,
          });
        }

        return { status: 'PAID', alreadyProcessed: false };
      } else if (payosInfo.status === 'CANCELLED') {
        payment.status = 'FAILED';
        await payment.save();
        return { status: 'FAILED' };
      }

      return { status: payment.status };
    } catch (err) {
      console.error('Error querying payOS:', err);
      // If payOS query fails, return current DB status
      return { status: payment.status };
    }
  }

  /**
   * Verify and handle payOS webhook
   */
  static async handleWebhook(webhookBody) {
    try {
      // Verify webhook data (payOS SDK handles checksum verification)
      const webhookData = payos.webhooks.verify(webhookBody);
      
      const { orderCode, amount, code, transactionDateTime, reference } = webhookData;
      
      const payment = await Payment.findOne({ orderCode });
      
      if (!payment) {
        console.error(`Webhook: Payment with orderCode ${orderCode} not found`);
        return { success: false, message: 'Payment not found' };
      }
      
      // If payment is already resolved, ignore
      if (payment.status === 'PAID' || payment.status === 'FAILED') {
        return { success: true, message: 'Payment already processed' };
      }
      
      payment.rawResponse = webhookData;
      
      if (code === '00') { // Success
        payment.status = 'PAID';
        payment.paidAt = new Date();
        payment.transactionId = reference || webhookData.transactionReference;
        
        await payment.save();
        
        // Update Appointment
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
          appointment.paymentStatus = 'PAID';
          appointment.status = 'confirmed';
          await appointment.save();
          
          // Send notification
          await Notification.create({
            user: payment.user,
            title: 'Payment Successful',
            message: `Payment of ${amount.toLocaleString()}đ has been completed successfully. Your appointment is confirmed.`,
            type: 'payment',
            relatedId: payment._id,
          });

          await AdminNotificationService.notifyAdmins({
            actor: payment.user,
            title: 'Thanh toán thành công',
            message: `Khách hàng đã thanh toán ${amount.toLocaleString('vi-VN')}đ cho lịch khám.`,
            type: 'payment',
            relatedId: payment._id,
          });
        }
      } else {
        payment.status = 'FAILED';
        await payment.save();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Webhook verification failed:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
