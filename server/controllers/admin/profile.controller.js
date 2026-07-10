const AdminProfileService = require('../../services/admin/profile.service');

/**
 * Profile Controller - Admin
 */
class AdminProfileController {
  /**
   * GET /api/admin/profile
   */
  static async getProfile(req, res, next) {
    try {
      const profile = await AdminProfileService.getProfile(req.user._id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const profile = await AdminProfileService.updateProfile(req.user._id, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AdminProfileService.changePassword(
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

module.exports = AdminProfileController;
