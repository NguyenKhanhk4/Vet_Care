const DoctorAppointmentService = require('../../services/doctor/appointment.service');

class DoctorAppointmentController {
  static async getAppointments(req, res, next) {
    try {
      const result = await DoctorAppointmentService.getAppointments(req.user._id, req.query, {
        page: req.query.page,
        limit: req.query.limit,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentById(req, res, next) {
    try {
      const result = await DoctorAppointmentService.getAppointmentById(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async confirmAppointment(req, res, next) {
    try {
      const result = await DoctorAppointmentService.updateAppointmentStatus(req.params.id, req.user._id, 'confirmed');
      res.status(200).json({ success: true, message: 'Đã xác nhận lịch hẹn', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async rejectAppointment(req, res, next) {
    try {
      const result = await DoctorAppointmentService.updateAppointmentStatus(req.params.id, req.user._id, 'cancelled');
      res.status(200).json({ success: true, message: 'Đã hủy lịch hẹn', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async completeAppointment(req, res, next) {
    try {
      const result = await DoctorAppointmentService.updateAppointmentStatus(req.params.id, req.user._id, 'completed');
      res.status(200).json({ success: true, message: 'Đã hoàn thành lịch hẹn', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorAppointmentController;
