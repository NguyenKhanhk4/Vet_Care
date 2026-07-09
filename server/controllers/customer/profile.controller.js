const ProfileService = require('../../services/customer/profile.service');

/**
 * Profile Controller - Customer
 * Handles HTTP requests for profile management
 */
class ProfileController {
  /**
   * GET /api/customer/users/profile
   * Get authenticated user's profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await ProfileService.getProfile(req.user._id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/users/profile
   * Update authenticated user's profile
   */
  static async updateProfile(req, res, next) {
    try {
      // If avatar was uploaded via multer
      const updateData = { ...req.body };
      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const user = await ProfileService.updateProfile(req.user._id, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/users/change-password
   * Change authenticated user's password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const result = await ProfileService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
