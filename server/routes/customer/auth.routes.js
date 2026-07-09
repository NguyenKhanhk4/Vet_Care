const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../../controllers/customer/auth.controller');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Authentication Routes
 * Base path: /api/customer/auth
 */

// POST /api/customer/auth/register
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10,11}$/).withMessage('Phone must be 10-11 digits'),
  ],
  validate,
  AuthController.register
);

// POST /api/customer/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

// POST /api/customer/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
  ],
  validate,
  AuthController.forgotPassword
);

module.exports = router;
