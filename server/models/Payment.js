const mongoose = require('mongoose');

/**
 * Payment Model
 * Represents a payment for an appointment via payOS
 */
const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    orderCode: {
      type: Number,
      required: [true, 'Order code is required for payOS'],
      unique: true,
    },
    paymentLinkId: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Payment description is required'],
    },
    checkoutUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    method: {
      type: String,
      enum: ['payos', 'cash'],
      default: 'payos',
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    rawResponse: {
      type: Object, // Store raw response from payOS webhook
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
