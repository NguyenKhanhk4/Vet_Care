const express = require('express');
const router = express.Router();
const AdminAuthController = require('../../controllers/admin/auth.controller');

/**
 * Admin Auth Routes
 * POST /api/admin/auth/login
 * POST /api/admin/auth/forgot-password
 */
router.post('/login', AdminAuthController.login);
router.post('/forgot-password', AdminAuthController.forgotPassword);

module.exports = router;
