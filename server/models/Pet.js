const mongoose = require('mongoose');

/**
 * Pet Model
 * Represents a pet owned by a customer
 * Each pet belongs to one owner (User with role: customer)
 */
const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pet owner is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      minlength: [1, 'Pet name must be at least 1 character'],
      maxlength: [50, 'Pet name cannot exceed 50 characters'],
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'],
    },
    breed: {
      type: String,
      trim: true,
      maxlength: [50, 'Breed cannot exceed 50 characters'],
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [50, 'Age seems too high'],
      default: 0,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      max: [200, 'Weight seems too high (in kg)'],
      default: 0,
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, 'Color cannot exceed 30 characters'],
      default: '',
    },
    vaccineStatus: {
      type: String,
      enum: ['up-to-date', 'overdue', 'not-vaccinated', 'unknown'],
      default: 'unknown',
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pet', petSchema);
