const Notification = require('../../models/Notification');
const User = require('../../models/User');

/**
 * Creates a separate notification for every active administrator. This keeps
 * each administrator's read state independent while retaining the actor who
 * caused the event.
 */
class AdminNotificationService {
  static async notifyAdmins({ actor, title, message, type, relatedId }) {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();

    if (!admins.length) return [];

    return Notification.insertMany(
      admins.map((admin) => ({
        user: admin._id,
        actor,
        audience: 'admin',
        title,
        message,
        type,
        relatedId,
      }))
    );
  }
}

module.exports = AdminNotificationService;
