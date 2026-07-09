const express = require('express');
const { body } = require('express-validator');
const ProfileController = require('../../controllers/customer/profile.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Profile Routes
 * Base path: /api/customer/users
 * All routes require authentication
 */

// Apply authentication to all profile routes
router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/users/profile
router.get('/profile', ProfileController.getProfile);

// PUT /api/customer/users/profile
router.put(
  '/profile',
  uploadAvatar,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9]{10,11}$/).withMessage('Phone must be 10-11 digits'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  ],
  validate,
  ProfileController.updateProfile
);

// PUT /api/customer/users/change-password
router.put(
  '/change-password',
  [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword')
      .notEmpty().withMessage('Password confirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  validate,
  ProfileController.changePassword
);

module.exports = router;
