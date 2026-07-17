const DoctorScheduleService = require('../../services/doctor/schedule.service');

class DoctorScheduleController {
  static async getTodaySchedule(req, res, next) {
    try {
      const result = await DoctorScheduleService.getTodaySchedule(req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getWeeklySchedule(req, res, next) {
    try {
      const result = await DoctorScheduleService.getWeeklySchedule(req.user._id, req.query.date);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
  static async addTimeOff(req, res, next) {
    try {
      const { date, reason } = req.body;
      const result = await DoctorScheduleService.addTimeOff(req.user._id, date, reason);
      res.status(200).json({ success: true, message: 'Đã đánh dấu nghỉ thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async removeTimeOff(req, res, next) {
    try {
      const { date } = req.params;
      const result = await DoctorScheduleService.removeTimeOff(req.user._id, date);
      res.status(200).json({ success: true, message: 'Đã hủy đánh dấu nghỉ thành công', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorScheduleController;
