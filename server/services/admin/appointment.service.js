const Appointment = require('../../models/Appointment');

/**
 * Appointment Management Service - Admin
 * Handles viewing and managing all appointments in the system
 */
class AdminAppointmentService {
  /**
   * Get all appointments with pagination, search and filters
   * @param {Object} query - { page, limit, status, search }
   * @returns {Object} - { appointments, pagination }
   */
  static async getAllAppointments(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('customer', 'name email phone')
        .populate('pet', 'name species breed')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' },
        })
        .populate('clinic', 'name address')
        .populate('services', 'name price duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get appointment by ID
   * @param {string} appointmentId
   * @returns {Object} appointment
   */
  static async getAppointmentById(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('customer', 'name email phone address')
      .populate('pet', 'name species breed age weight gender')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'clinic', select: 'name address' },
        ],
      })
      .populate('clinic', 'name address phone')
      .populate('services', 'name price duration category description')
      .lean();

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    return appointment;
  }

  /**
   * Update appointment (status, reschedule)
   * @param {string} appointmentId
   * @param {Object} updateData
   * @returns {Object} updated appointment
   */
  static async updateAppointment(appointmentId, updateData) {
    const allowedFields = ['status', 'date', 'time', 'notes'];
    const filteredData = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const appointment = await Appointment.findByIdAndUpdate(appointmentId, filteredData, {
      new: true,
      runValidators: true,
    })
      .populate('customer', 'name email phone')
      .populate('pet', 'name species breed')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .populate('clinic', 'name')
      .populate('services', 'name price');

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    return appointment;
  }

  /**
   * Delete appointment
   * @param {string} appointmentId
   */
  static async deleteAppointment(appointmentId) {
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Appointment deleted successfully' };
  }
}

module.exports = AdminAppointmentService;
