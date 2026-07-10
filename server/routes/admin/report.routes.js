const express = require('express');
const router = express.Router();
const AdminReportController = require('../../controllers/admin/report.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Report Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminReportController.getReports);

module.exports = router;
