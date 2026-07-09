const AdminNotificationService = require('../../services/admin/notification.service');

/**
 * Notification Controller - Admin
 */
class AdminNotificationController {
  /**
   * GET /api/admin/notifications
   */
  static async getNotifications(req, res, next) {
    try {
      const result = await AdminNotificationService.getNotifications(req.user._id, req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const result = await AdminNotificationService.markAsRead(req.params.id, req.user._id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/notifications/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await AdminNotificationService.markAllAsRead(req.user._id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminNotificationController;
