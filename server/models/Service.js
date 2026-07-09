const mongoose = require('mongoose');

/**
 * Service Model
 * Represents a veterinary service offered by a clinic
 * Each service belongs to one clinic
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters'],
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic reference is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['checkup', 'vaccination', 'surgery', 'grooming', 'dental', 'emergency', 'laboratory', 'other'],
      default: 'other',
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
