const mongoose = require('mongoose');

/**
 * Vaccination Model
 * Represents a vaccination record for a pet
 */
const vaccinationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet reference is required'],
      index: true,
    },
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
      maxlength: [100, 'Vaccine name cannot exceed 100 characters'],
    },
    vaccineType: {
      type: String,
      trim: true,
      maxlength: [50, 'Vaccine type cannot exceed 50 characters'],
      default: '',
    },
    vaccinationDate: {
      type: Date,
      required: [true, 'Vaccination date is required'],
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next due date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
