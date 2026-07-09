const NotificationService = require('../../services/customer/notification.service');

/**
 * Notification Controller - Customer
 * Handles notification listing and read status
 */
class NotificationController {
  /**
   * GET /api/customer/notifications
   */
  static async getAllNotifications(req, res, next) {
    try {
      const result = await NotificationService.getAllNotifications(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.notifications.length,
        total: result.total,
        unreadCount: result.unreadCount,
        page: result.page,
        pages: result.pages,
        data: result.notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user._id);

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/notifications/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user._id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
