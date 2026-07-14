const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');

class DoctorScheduleService {
  static async getTodaySchedule(userId) {
    const doctor = await DoctorScheduleService._getDoctorByUserId(userId);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('customer', 'name phone avatar')
      .populate('pet', 'name species breed age image')
      .populate('services', 'name duration')
      .sort({ time: 1 });

    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;

    return {
      date: today.toISOString().split('T')[0],
      appointments,
      stats: { total, pending, confirmed, completed },
    };
  }

  static async getWeeklySchedule(userId, queryDate) {
    const doctor = await DoctorScheduleService._getDoctorByUserId(userId);

    const today = queryDate ? new Date(queryDate) : new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: monday, $lte: sunday },
    })
      .populate('customer', 'name phone avatar')
      .populate('pet', 'name species breed age image')
      .populate('services', 'name duration')
      .sort({ date: 1, time: 1 });

    const grouped = {};
    appointments.forEach((appt) => {
      const dateKey = new Date(appt.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(appt);
    });

    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateKey = day.toISOString().split('T')[0];
      schedule.push({
        date: dateKey,
        dayName: dayNames[day.getDay()],
        appointments: grouped[dateKey] || [],
      });
    }

    return {
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
      schedule,
    };
  }

  static async _getDoctorByUserId(userId) {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      const error = new Error('Không tìm thấy hồ sơ bác sĩ');
      error.statusCode = 404;
      throw error;
    }
    return doctor;
  }
}

module.exports = DoctorScheduleService;
