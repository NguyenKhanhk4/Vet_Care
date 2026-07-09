const User = require('../../models/User');
const bcrypt = require('bcryptjs');

/**
 * Profile Service - Admin
 * Handles admin profile viewing and updating
 */
class AdminProfileService {
  /**
   * Get admin profile
   * @param {string} userId
   * @returns {Object} user profile
   */
  static async getProfile(userId) {
    const user = await User.findById(userId).lean();

    if (!user) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update admin profile
   * @param {string} userId
   * @param {Object} updateData - { name, phone, address }
   * @returns {Object} updated profile
   */
  static async updateProfile(userId, updateData) {
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'phone', 'address'];
    const filteredData = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    if (updateData.avatar !== undefined) {
      filteredData.avatar = updateData.avatar;
    }

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Change admin password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Object} - { message }
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new Error('Admin not found');
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

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = AdminProfileService;
