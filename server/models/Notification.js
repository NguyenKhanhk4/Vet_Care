const mongoose = require('mongoose');

/**
 * Notification Model
 * Represents notifications sent to users
 * Types: booking confirmations, payment receipts, reminders, completion notices
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    // The user who triggered the event. For admin notifications, `user` is the
    // admin recipient while `actor` identifies the customer or doctor involved.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    audience: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['booking', 'payment', 'reminder', 'completion'],
      required: [true, 'Notification type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // Can reference appointment, payment, etc.
    },
    // Links a migrated admin notification to its original user notification.
    sourceNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of unread notifications
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, sourceNotification: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);
