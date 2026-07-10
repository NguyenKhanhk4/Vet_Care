const AdminServiceService = require('../../services/admin/service.service');

/**
 * Service Management Controller - Admin
 */
class AdminServiceController {
  /**
   * GET /api/admin/services
   */
  static async getAllServices(req, res, next) {
    try {
      const result = await AdminServiceService.getAllServices(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/services/:id
   */
  static async getServiceById(req, res, next) {
    try {
      const service = await AdminServiceService.getServiceById(req.params.id);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/services
   */
  static async createService(req, res, next) {
    try {
      const service = await AdminServiceService.createService(req.body);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/services/:id
   */
  static async updateService(req, res, next) {
    try {
      const service = await AdminServiceService.updateService(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/services/:id
   */
  static async deleteService(req, res, next) {
    try {
      const result = await AdminServiceService.deleteService(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminServiceController;
