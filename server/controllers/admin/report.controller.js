const AdminReportService = require('../../services/admin/report.service');

/**
 * Report Controller - Admin
 */
class AdminReportController {
  /**
   * GET /api/admin/reports
   */
  static async getReports(req, res, next) {
    try {
      const data = await AdminReportService.getReports(req.query);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminReportController;
