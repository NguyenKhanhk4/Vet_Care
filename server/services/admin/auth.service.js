const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Authentication Service - Admin
 * Handles login and password reset logic for admin role
 * Note: Admin accounts are pre-created in the database, no registration
 */
class AdminAuthService {
  /**
   * Generate JWT token for admin
   * @param {string} userId - Admin's MongoDB ObjectId
   * @returns {string} JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Login an admin
   * @param {string} email - Admin's email
   * @param {string} password - Admin's password
   * @returns {Object} - { user, token }
   */
  static async login(email, password) {
    // Find user with admin role and include password field
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Forgot password - simulated email reset
   * @param {string} email - Admin's email
   * @returns {Object} - { message }
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email, role: 'admin' });

    if (!user) {
      const error = new Error('No admin account found with this email');
      error.statusCode = 404;
      throw error;
    }

    // In a real app, generate reset token and send email
    return {
      message: 'Password reset instructions have been sent to your email',
    };
  }
}

module.exports = AdminAuthService;
