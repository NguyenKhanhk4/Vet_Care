const mongoose = require('mongoose');

/**
 * Medical Record Model
 * Represents a medical record created after an appointment is completed
 * Customer can only view, not edit these records
 */
const medicalRecordSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true, // One record per appointment
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet reference is required'],
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters'],
    },
    symptoms: {
      type: String,
      trim: true,
      maxlength: [1000, 'Symptoms cannot exceed 1000 characters'],
      default: '',
    },
    prescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Prescription cannot exceed 1000 characters'],
      default: '',
    },
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Doctor notes cannot exceed 1000 characters'],
      default: '',
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },
    date: {
      type: Date,
      required: [true, 'Record date is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
