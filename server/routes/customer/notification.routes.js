const express = require('express');
const NotificationController = require('../../controllers/customer/notification.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * Customer Notification Routes
 * Base path: /api/customer/notifications
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/notifications?page=1&limit=20&unreadOnly=true
router.get('/', NotificationController.getAllNotifications);

// PUT /api/customer/notifications/read-all
router.put('/read-all', NotificationController.markAllAsRead);

// PUT /api/customer/notifications/:id/read
router.put('/:id/read', NotificationController.markAsRead);

module.exports = router;
