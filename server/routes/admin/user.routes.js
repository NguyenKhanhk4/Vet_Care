const express = require('express');
const router = express.Router();
const AdminUserController = require('../../controllers/admin/user.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin User Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminUserController.getAllUsers);
router.get('/:id', AdminUserController.getUserById);
router.put('/:id', AdminUserController.updateUser);
router.delete('/:id', AdminUserController.deleteUser);
router.put('/:id/status', AdminUserController.updateUserStatus);

module.exports = router;
