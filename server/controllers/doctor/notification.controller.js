const DoctorNotificationService = require('../../services/doctor/notification.service');

class DoctorNotificationController {
  static async getNotifications(req, res, next) {
    try {
      const result = await DoctorNotificationService.getNotifications(req.user._id, {
        page: req.query.page,
        limit: req.query.limit,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const result = await DoctorNotificationService.markAsRead(req.params.id, req.user._id);
      res.status(200).json({ success: true, message: 'Đã đánh dấu đọc', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await DoctorNotificationService.markAllAsRead(req.user._id);
      res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorNotificationController;
