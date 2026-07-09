const express = require('express');
const router = express.Router();
const SharedAuthController = require('../../controllers/shared/auth.controller');

/**
 * Shared Auth Routes
 * POST /api/auth/login
 */
router.post('/login', SharedAuthController.login);

module.exports = router;
