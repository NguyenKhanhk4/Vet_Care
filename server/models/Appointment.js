const mongoose = require('mongoose');

/**
 * Appointment Model
 * Represents a booking between a customer and a doctor at a clinic
 * Tracks status through the appointment lifecycle
 */
const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet is required'],
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'At least one service is required'],
    }],
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String, // Format: "HH:mm"
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'paid'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'payos'],
      default: 'cash',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double-booking for the same doctor at the same time
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
