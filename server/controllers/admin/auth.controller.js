const AdminAuthService = require('../../services/admin/auth.service');

/**
 * Authentication Controller - Admin
 * Handles HTTP requests for admin login and password reset
 */
class AdminAuthController {
  /**
   * POST /api/admin/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AdminAuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AdminAuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminAuthController;
