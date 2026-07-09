const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Authentication Service - Customer
 * Handles registration, login, and password reset logic
 */
class AuthService {
  /**
   * Generate JWT token for a user
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {string} JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Register a new customer
   * @param {Object} userData - { name, email, password, phone }
   * @returns {Object} - { user, token }
   */
  static async register(userData) {
    const { name, email, password, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    // Create new user with customer role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    // Generate JWT token
    const token = this.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Login a customer
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - { user, token }
   */
  static async login(email, password) {
    // Find user and include password field
    const user = await User.findOne({ email, role: 'customer' }).select('+password');

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
   * In production, this would send an actual email with a reset link
   * @param {string} email - User's email
   * @returns {Object} - { message }
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email, role: 'customer' });

    if (!user) {
      const error = new Error('No account found with this email');
      error.statusCode = 404;
      throw error;
    }

    // In a real app, generate reset token and send email
    // For simulation, just return success message
    return {
      message: 'Password reset instructions have been sent to your email',
    };
  }
}

module.exports = AuthService;
