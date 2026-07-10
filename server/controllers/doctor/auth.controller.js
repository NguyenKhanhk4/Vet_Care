const DoctorAuthService = require('../../services/doctor/auth.service');

class DoctorAuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await DoctorAuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await DoctorAuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorAuthController;
