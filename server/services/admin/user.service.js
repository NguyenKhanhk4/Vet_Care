const User = require('../../models/User');

/**
 * User Management Service - Admin
 * Handles CRUD operations for customer accounts
 */
class AdminUserService {
  /**
   * Get all customers with pagination and search
   * @param {Object} query - { page, limit, search, status }
   * @returns {Object} - { users, pagination }
   */
  static async getAllUsers(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (query.role) {
      filter.role = query.role;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   * @param {string} userId
   * @returns {Object} user
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update user information
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Object} updated user
   */
  static async updateUser(userId, updateData) {
    // Prevent role changes through this endpoint
    delete updateData.password;
    delete updateData.role;

    const user = await User.findByIdAndUpdate(userId, updateData, {
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
   * Delete user account
   * @param {string} userId
   */
  static async deleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot delete admin account');
      error.statusCode = 403;
      throw error;
    }

    await User.findByIdAndDelete(userId);
    return { message: 'User deleted successfully' };
  }

  /**
   * Toggle user active status (lock/unlock)
   * @param {string} userId
   * @param {boolean} isActive
   * @returns {Object} updated user
   */
  static async updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot change admin account status');
      error.statusCode = 403;
      throw error;
    }

    user.isActive = isActive;
    await user.save();

    return user;
  }
}

module.exports = AdminUserService;
