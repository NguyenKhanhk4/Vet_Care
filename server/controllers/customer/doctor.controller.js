const DoctorService = require('../../services/customer/doctor.service');

/**
 * Doctor Controller - Customer
 * Read-only access to doctor data
 */
class DoctorController {
  /**
   * GET /api/customer/doctors
   */
  static async getAllDoctors(req, res, next) {
    try {
      const result = await DoctorService.getAllDoctors(req.query);

      res.status(200).json({
        success: true,
        count: result.doctors.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/doctors/:id
   */
  static async getDoctorById(req, res, next) {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.id);

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorController;
