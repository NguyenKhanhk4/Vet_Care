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
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự')
      .matches(/^[\p{L}\s]+$/u)
      .withMessage('Tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ (gồm 10-11 chữ số)'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Địa chỉ không được vượt quá 200 ký tự'),
    body('specialization')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Chuyên khoa không được vượt quá 100 ký tự'),
    body('experience')
      .optional()
      .isInt({ min: 0, max: 50 }).withMessage('Kinh nghiệm phải là số từ 0-50'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Giới thiệu không được vượt quá 500 ký tự'),
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
