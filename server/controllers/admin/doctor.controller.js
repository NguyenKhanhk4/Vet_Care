const AdminDoctorService = require('../../services/admin/doctor.service');

/**
 * Doctor Management Controller - Admin
 */
class AdminDoctorController {
  /**
   * GET /api/admin/doctors
   */
  static async getAllDoctors(req, res, next) {
    try {
      const result = await AdminDoctorService.getAllDoctors(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/doctors/:id
   */
  static async getDoctorById(req, res, next) {
    try {
      const doctor = await AdminDoctorService.getDoctorById(req.params.id);

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/doctors
   */
  static async createDoctor(req, res, next) {
    try {
      const doctor = await AdminDoctorService.createDoctor(req.body);

      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/doctors/:id
   */
  static async updateDoctor(req, res, next) {
    try {
      const doctor = await AdminDoctorService.updateDoctor(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/doctors/:id
   */
  static async deleteDoctor(req, res, next) {
    try {
      const result = await AdminDoctorService.deleteDoctor(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminDoctorController;
