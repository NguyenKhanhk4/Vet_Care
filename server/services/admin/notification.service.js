const Notification = require('../../models/Notification');

/**
 * Notification Service - Admin
 * Handles fetching notifications for admin
 */
class AdminNotificationService {
  /**
   * Get all admin notifications
   * @param {string} userId - Admin user ID
   * @param {Object} query - { page, limit }
   * @returns {Object} - { notifications, pagination, unreadCount }
   */
  static async getNotifications(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Admin sees all system notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find()
        .populate('user', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @param {string} userId
   */
  static async markAsRead(notificationId, userId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true }
    );

    return { message: 'Notification marked as read' };
  }

  /**
   * Mark all notifications as read
   * @param {string} userId
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return { message: 'All notifications marked as read' };
  }
}

module.exports = AdminNotificationService;
