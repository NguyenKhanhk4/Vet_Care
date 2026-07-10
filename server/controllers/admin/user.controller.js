const AdminUserService = require('../../services/admin/user.service');

/**
 * User Management Controller - Admin
 */
class AdminUserController {
  /**
   * GET /api/admin/users
   */
  static async getAllUsers(req, res, next) {
    try {
      const result = await AdminUserService.getAllUsers(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const user = await AdminUserService.getUserById(req.params.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/users/:id
   */
  static async updateUser(req, res, next) {
    try {
      const user = await AdminUserService.updateUser(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res, next) {
    try {
      const result = await AdminUserService.deleteUser(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/users/:id/status
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await AdminUserService.updateUserStatus(req.params.id, isActive);

      res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminUserController;
