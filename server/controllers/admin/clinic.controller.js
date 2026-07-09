const AdminClinicService = require('../../services/admin/clinic.service');

/**
 * Clinic Management Controller - Admin
 */
class AdminClinicController {
  /**
   * GET /api/admin/clinics
   */
  static async getAllClinics(req, res, next) {
    try {
      const result = await AdminClinicService.getAllClinics(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/clinics/:id
   */
  static async getClinicById(req, res, next) {
    try {
      const clinic = await AdminClinicService.getClinicById(req.params.id);

      res.status(200).json({
        success: true,
        data: clinic,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/clinics
   */
  static async createClinic(req, res, next) {
    try {
      const clinic = await AdminClinicService.createClinic(req.body);

      res.status(201).json({
        success: true,
        message: 'Clinic created successfully',
        data: clinic,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/clinics/:id
   */
  static async updateClinic(req, res, next) {
    try {
      const clinic = await AdminClinicService.updateClinic(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Clinic updated successfully',
        data: clinic,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/clinics/:id
   */
  static async deleteClinic(req, res, next) {
    try {
      const result = await AdminClinicService.deleteClinic(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminClinicController;
