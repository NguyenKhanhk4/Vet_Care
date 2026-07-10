const AppointmentService = require('../../services/customer/appointment.service');

/**
 * Appointment Controller - Customer
 * Handles HTTP requests for appointment management
 */
class AppointmentController {
  /**
   * GET /api/customer/appointments
   */
  static async getAllAppointments(req, res, next) {
    try {
      const result = await AppointmentService.getAllAppointments(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.appointments.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/appointments/booked-times
   */
  static async getBookedTimes(req, res, next) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) {
        return res.status(400).json({ success: false, message: 'doctorId and date are required' });
      }

      const bookedTimes = await AppointmentService.getBookedTimes(doctorId, date);

      res.status(200).json({
        success: true,
        data: bookedTimes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/appointments/:id
   */
  static async getAppointmentById(req, res, next) {
    try {
      const appointment = await AppointmentService.getAppointmentById(
        req.params.id,
        req.user._id
      );

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customer/appointments
   */
  static async createAppointment(req, res, next) {
    try {
      const appointment = await AppointmentService.createAppointment(req.user._id, req.body);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/appointments/:id
   */
  static async updateAppointment(req, res, next) {
    try {
      const appointment = await AppointmentService.updateAppointment(
        req.params.id,
        req.user._id,
        req.body
      );

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
   * DELETE /api/customer/appointments/:id
   */
  static async cancelAppointment(req, res, next) {
    try {
      const appointment = await AppointmentService.cancelAppointment(
        req.params.id,
        req.user._id
      );

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AppointmentController;
