const express = require('express');
const { body } = require('express-validator');
const DoctorAuthController = require('../../controllers/doctor/auth.controller');
const validate = require('../../middlewares/validate.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  message: { success: false, message: 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
});

router.post(
  '/login',
  loginLimiter,
  [
    body('email').notEmpty().withMessage('Vui lòng nhập email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  ],
  validate,
  DoctorAuthController.login
);

router.post(
  '/forgot-password',
  [
    body('email').notEmpty().withMessage('Vui lòng nhập email').isEmail().withMessage('Email không hợp lệ'),
  ],
  validate,
  DoctorAuthController.forgotPassword
);

module.exports = router;
