const AuthService = require('../../services/customer/auth.service');

/**
 * Authentication Controller - Customer
 * Handles HTTP requests for registration, login, and password reset
 */
class AuthController {
  /**
   * POST /api/customer/auth/register
   * Register a new customer account
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const result = await AuthService.register({ name, email, password, phone });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customer/auth/login
   * Login with email and password
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customer/auth/forgot-password
   * Request password reset
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
