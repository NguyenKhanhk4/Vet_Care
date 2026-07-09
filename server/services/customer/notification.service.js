const Notification = require('../../models/Notification');

/**
 * Notification Service - Customer
 * Handles notification retrieval and marking as read
 */
class NotificationService {
  /**
   * Get all notifications for a customer
   * @param {string} userId - User's MongoDB ObjectId
   * @param {Object} query - { page, limit, unreadOnly }
   * @returns {Object} - { notifications, total, unreadCount, page, pages }
   */
  static async getAllNotifications(userId, query = {}) {
    const { page = 1, limit = 20, unreadOnly } = query;
    const filter = { user: userId };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification's MongoDB ObjectId
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {Object} - Updated notification
   */
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {Object} - Result
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return { message: 'All notifications marked as read' };
  }
}

module.exports = NotificationService;
