const ServiceService = require('../../services/customer/service.service');

/**
 * Service Controller - Customer
 * Read-only access to veterinary services
 */
class ServiceController {
  /**
   * GET /api/customer/services
   */
  static async getAllServices(req, res, next) {
    try {
      const result = await ServiceService.getAllServices(req.query);

      res.status(200).json({
        success: true,
        count: result.services.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/services/:id
   */
  static async getServiceById(req, res, next) {
    try {
      const service = await ServiceService.getServiceById(req.params.id);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;
