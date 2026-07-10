const SharedAuthService = require('../../services/shared/auth.service');

class SharedAuthController {
  /**
   * POST /api/auth/login
   * Unified login for all roles (Customer, Admin, Doctor)
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const error = new Error('Please provide email and password');
        error.statusCode = 400;
        throw error;
      }

      const result = await SharedAuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SharedAuthController;
