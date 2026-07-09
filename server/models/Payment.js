const mongoose = require('mongoose');

/**
 * Payment Model
 * Represents a payment for an appointment
 * Supports VNPay, MoMo, and Cash payment methods (simulated)
 */
const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    method: {
      type: String,
      enum: ['vnpay', 'momo', 'cash'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to generate transaction ID
 */
paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const prefix = this.method.toUpperCase();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
