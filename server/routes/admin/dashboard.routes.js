const express = require('express');
const router = express.Router();
const AdminDashboardController = require('../../controllers/admin/dashboard.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Dashboard Routes
 * GET /api/admin/dashboard
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminDashboardController.getDashboard);

module.exports = router;
