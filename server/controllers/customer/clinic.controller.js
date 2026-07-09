const ClinicService = require('../../services/customer/clinic.service');

/**
 * Clinic Controller - Customer
 * Read-only access to clinic data
 */
class ClinicController {
  /**
   * GET /api/customer/clinics
   */
  static async getAllClinics(req, res, next) {
    try {
      const result = await ClinicService.getAllClinics(req.query);

      res.status(200).json({
        success: true,
        count: result.clinics.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.clinics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/clinics/:id
   */
  static async getClinicById(req, res, next) {
    try {
      const clinic = await ClinicService.getClinicById(req.params.id);

      res.status(200).json({
        success: true,
        data: clinic,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClinicController;
