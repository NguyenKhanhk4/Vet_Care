const express = require('express');
const { body } = require('express-validator');
const ReviewController = require('../../controllers/customer/review.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Review Routes
 * Base path: /api/customer/reviews
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// POST /api/customer/reviews
router.post(
  '/',
  [
    body('appointmentId')
      .notEmpty().withMessage('Appointment ID is required')
      .isMongoId().withMessage('Invalid appointment ID'),
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  ],
  validate,
  ReviewController.createReview
);

// GET /api/customer/reviews?page=1&limit=10
router.get('/', ReviewController.getMyReviews);

module.exports = router;
