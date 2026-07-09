const express = require('express');
const router = express.Router();
const AdminNotificationController = require('../../controllers/admin/notification.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Notification Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminNotificationController.getNotifications);
router.put('/read-all', AdminNotificationController.markAllAsRead);
router.put('/:id/read', AdminNotificationController.markAsRead);

module.exports = router;
