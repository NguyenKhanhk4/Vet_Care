const express = require('express');
const DoctorNotificationController = require('../../controllers/doctor/notification.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.get('/', DoctorNotificationController.getNotifications);
router.put('/read-all', DoctorNotificationController.markAllAsRead);
router.put('/:id/read', DoctorNotificationController.markAsRead);

module.exports = router;
