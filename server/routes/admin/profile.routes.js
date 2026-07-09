const express = require('express');
const router = express.Router();
const AdminProfileController = require('../../controllers/admin/profile.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');

/**
 * Admin Profile Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminProfileController.getProfile);
router.put('/', uploadAvatar, AdminProfileController.updateProfile);
router.put('/change-password', AdminProfileController.changePassword);

module.exports = router;
