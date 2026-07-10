const jwt = require('jsonwebtoken');
const User = require('../../models/User');

class SharedAuthService {
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  static async login(email, password) {
    // Find user by email (regardless of role)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.isActive === false) {
      const error = new Error('Your account has been deactivated');
      error.statusCode = 403;
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
}

module.exports = SharedAuthService;
