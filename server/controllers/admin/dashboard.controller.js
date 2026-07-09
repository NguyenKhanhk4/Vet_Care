const AdminDashboardService = require('../../services/admin/dashboard.service');

/**
 * Dashboard Controller - Admin
 */
class AdminDashboardController {
  /**
   * GET /api/admin/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const data = await AdminDashboardService.getDashboardStats();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminDashboardController;
