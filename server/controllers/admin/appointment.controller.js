const AdminAppointmentService = require('../../services/admin/appointment.service');

/**
 * Appointment Management Controller - Admin
 */
class AdminAppointmentController {
  /**
   * GET /api/admin/appointments
   */
  static async getAllAppointments(req, res, next) {
    try {
      const result = await AdminAppointmentService.getAllAppointments(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/appointments/:id
   */
  static async getAppointmentById(req, res, next) {
    try {
      const appointment = await AdminAppointmentService.getAppointmentById(req.params.id);

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/appointments/:id
   */
  static async updateAppointment(req, res, next) {
    try {
      const appointment = await AdminAppointmentService.updateAppointment(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/appointments/:id
   */
  static async deleteAppointment(req, res, next) {
    try {
      const result = await AdminAppointmentService.deleteAppointment(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminAppointmentController;
