const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
const Doctor = require('../../models/Doctor');

class DoctorAuthService {
  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Email hoặc mật khẩu không đúng');
      error.statusCode = 401;
      throw error;
    }

    if (user.role !== 'doctor') {
      const error = new Error('Truy cập bị từ chối. Trang đăng nhập này chỉ dành cho bác sĩ.');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Email hoặc mật khẩu không đúng');
      error.statusCode = 401;
      throw error;
    }

    const doctor = await Doctor.findOne({ user: user._id }).populate('clinic', 'name address phone');

    if (!doctor) {
      const error = new Error('Không tìm thấy hồ sơ bác sĩ. Vui lòng liên hệ quản trị viên.');
      error.statusCode = 404;
      throw error;
    }

    if (!doctor.isActive) {
      const error = new Error('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    return {
      user: user.toJSON(),
      doctor,
      token,
    };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user || user.role !== 'doctor') {
      return { message: 'Nếu email này đã được đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi đến.' };
    }

    // TODO: Generate a real reset token and save to user document here in the future
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Client URL (placeholder)

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: process.env.SMTP_PORT || 2525,
        auth: {
          user: process.env.SMTP_USER || 'user',
          pass: process.env.SMTP_PASS || 'pass',
        },
      });

      const message = {
        from: `${process.env.FROM_NAME || 'VetCare System'} <${process.env.FROM_EMAIL || 'noreply@vetcare.com'}>`,
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu VetCare (Dành cho Bác sĩ)',
        text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.\n\nVui lòng nhấn vào đường dẫn sau để tiếp tục:\n\n${resetUrl}\n\nNếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email này.\n`,
      };

      await transporter.sendMail(message);

      return {
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.',
      };
    } catch (error) {
      console.error('Email error:', error);
      const emailError = new Error('Không thể gửi email. Vui lòng thử lại sau.');
      emailError.statusCode = 500;
      throw emailError;
    }
  }
}

module.exports = DoctorAuthService;
