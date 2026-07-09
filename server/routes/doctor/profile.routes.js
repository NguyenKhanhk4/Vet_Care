const express = require('express');
const { body } = require('express-validator');
const DoctorProfileController = require('../../controllers/doctor/profile.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { uploadAvatar } = require('../../middlewares/upload.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.get('/', DoctorProfileController.getProfile);

router.put(
  '/',
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    body('phone').optional().matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('specialization').optional().trim().isLength({ max: 100 }),
    body('experience').optional().isInt({ min: 0, max: 50 }).withMessage('Kinh nghiệm phải là số từ 0-50'),
    body('bio').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  DoctorProfileController.updateProfile
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('newPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu mới').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  validate,
  DoctorProfileController.changePassword
);

router.put('/avatar', uploadAvatar, DoctorProfileController.uploadAvatar);

module.exports = router;
