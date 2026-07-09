const mongoose = require('mongoose');

/**
 * Clinic Model
 * Represents a veterinary clinic
 * Contains information about the clinic, its services, and doctors
 */
const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
      minlength: [2, 'Clinic name must be at least 2 characters'],
      maxlength: [100, 'Clinic name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Clinic address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Clinic phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    openingHours: {
      type: String,
      default: '08:00 - 18:00',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Clinic', clinicSchema);
