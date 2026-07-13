const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Notification = require('../../models/Notification');

class DoctorAppointmentService {
  static async getAppointments(userId, filters = {}, pagination = {}) {
    const doctor = await DoctorAppointmentService._getDoctorByUserId(userId);

    const query = { doctor: doctor._id };
    if (filters.status) query.status = filters.status;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('customer', 'name email phone avatar')
        .populate('pet', 'name species breed age gender image')
        .populate('service', 'name price duration')
        .populate('clinic', 'name address')
        .sort({ date: -1, time: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return { appointments, total, page, pages: Math.ceil(total / limit) };
  }

  static async getAppointmentById(appointmentId, userId) {
    const doctor = await DoctorAppointmentService._getDoctorByUserId(userId);

    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id })
      .populate('customer', 'name email phone avatar')
      .populate('pet', 'name species breed age gender weight color image vaccineStatus')
      .populate('service', 'name price duration description')
      .populate('clinic', 'name address phone');

    if (!appointment) {
      const error = new Error('Không tìm thấy lịch hẹn');
      error.statusCode = 404;
      throw error;
    }

    return appointment;
  }

  static async updateAppointmentStatus(appointmentId, userId, newStatus) {
    const doctor = await DoctorAppointmentService._getDoctorByUserId(userId);

    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });

    if (!appointment) {
      const error = new Error('Không tìm thấy lịch hẹn');
      error.statusCode = 404;
      throw error;
    }

    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    const allowed = allowedTransitions[appointment.status] || [];
    if (!allowed.includes(newStatus)) {
      const error = new Error(
        `Không thể chuyển trạng thái từ '${appointment.status}' sang '${newStatus}'`
      );
      error.statusCode = 400;
      throw error;
    }

    appointment.status = newStatus;
    await appointment.save();

    // Thông báo cho khách hàng khi bác sĩ cập nhật trạng thái
    const statusMessages = {
      confirmed: {
        title: 'Lịch hẹn đã được xác nhận',
        message: `Lịch hẹn ngày ${new Date(appointment.date).toLocaleDateString('vi-VN')} lúc ${appointment.time} đã được bác sĩ xác nhận.`,
      },
      cancelled: {
        title: 'Lịch hẹn đã bị hủy',
        message: `Lịch hẹn ngày ${new Date(appointment.date).toLocaleDateString('vi-VN')} lúc ${appointment.time} đã bị hủy bởi bác sĩ.`,
      },
      completed: {
        title: 'Lịch hẹn hoàn thành',
        message: `Lịch hẹn ngày ${new Date(appointment.date).toLocaleDateString('vi-VN')} lúc ${appointment.time} đã hoàn thành. Cảm ơn bạn đã tin tưởng VetCare!`,
      },
    };

    if (statusMessages[newStatus]) {
      await Notification.create({
        user: appointment.customer,
        title: statusMessages[newStatus].title,
        message: statusMessages[newStatus].message,
        type: 'booking',
        relatedId: appointment._id,
      });
    }

    await appointment.populate([
      { path: 'customer', select: 'name email phone avatar' },
      { path: 'pet', select: 'name species breed age image' },
      { path: 'service', select: 'name price duration' },
    ]);

    return appointment;
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

module.exports = DoctorAppointmentService;
