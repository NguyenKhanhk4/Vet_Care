const express = require('express');
const router = express.Router();
const AdminReviewController = require('../../controllers/admin/review.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Review Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminReviewController.getAllReviews);
router.delete('/:id', AdminReviewController.deleteReview);

module.exports = router;
