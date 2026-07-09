const User = require('../../models/User');

/**
 * Profile Service - Customer
 * Handles profile viewing, editing, and password change
 */
class ProfileService {
  /**
   * Get user profile by ID
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {Object} - User profile data
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User's MongoDB ObjectId
   * @param {Object} updateData - { name, phone, address, avatar }
   * @returns {Object} - Updated user profile
   */
  static async updateProfile(userId, updateData) {
    // Only allow specific fields to be updated
    const allowedUpdates = ['name', 'phone', 'address', 'avatar'];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Change user password
   * @param {string} userId - User's MongoDB ObjectId
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Success message
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = ProfileService;
