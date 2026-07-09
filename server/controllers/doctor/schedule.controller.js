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
      const result = await DoctorScheduleService.getWeeklySchedule(req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorScheduleController;
