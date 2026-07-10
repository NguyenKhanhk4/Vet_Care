const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');
const Notification = require('../../models/Notification');

/**
 * Appointment Service - Customer
 * Handles appointment booking, viewing, cancellation, and rescheduling
 */
class AppointmentService {
  /**
   * Get all appointments for a customer
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} query - { status, page, limit }
   * @returns {Object} - { appointments, total, page, pages }
   */
  static async getAllAppointments(customerId, query = {}) {
    const { status, page = 1, limit = 10 } = query;
    const filter = { customer: customerId };

    if (status) {
      filter.status = status;
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('pet', 'name species breed image')
      .populate('clinic', 'name address phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('service', 'name price duration')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      appointments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific appointment by ID
   * @param {string} appointmentId - Appointment's MongoDB ObjectId
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @returns {Object} - Appointment data
   */
  static async getAppointmentById(appointmentId, customerId) {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: customerId,
    })
      .populate('pet', 'name species breed image gender age weight')
      .populate('clinic', 'name address phone email openingHours')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('service', 'name description price duration category');

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    return appointment;
  }

  /**
   * Create a new appointment
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} appointmentData - { pet, clinic, doctor, service, date, time, notes }
   * @returns {Object} - Created appointment
   */
  static async createAppointment(customerId, appointmentData) {
    const { pet, clinic, doctor, service, date, time, notes, paymentMethod = 'cash' } = appointmentData;

    // Get service price for total amount
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    // Check for double booking
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: new Date(date),
      time,
      status: { $nin: ['cancelled'] },
    });

    if (existingAppointment) {
      const error = new Error('This time slot is already booked. Please choose another time.');
      error.statusCode = 400;
      throw error;
    }

    // Create appointment
    const appointment = await Appointment.create({
      customer: customerId,
      pet,
      clinic,
      doctor,
      service,
      date: new Date(date),
      time,
      notes: notes || '',
      totalAmount: serviceData.price,
      status: 'pending',
      paymentMethod,
    });

    // Create notification for booking
    await Notification.create({
      user: customerId,
      title: 'Booking Confirmed',
      message: `Your appointment has been booked for ${new Date(date).toLocaleDateString()} at ${time}`,
      type: 'booking',
      relatedId: appointment._id,
    });

    // Return populated appointment
    return await this.getAppointmentById(appointment._id, customerId);
  }

  /**
   * Update an appointment (reschedule)
   * @param {string} appointmentId - Appointment's MongoDB ObjectId
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} updateData - { date, time, notes }
   * @returns {Object} - Updated appointment
   */
  static async updateAppointment(appointmentId, customerId, updateData) {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: customerId,
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Only allow updates for pending or confirmed appointments
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      const error = new Error('Cannot modify this appointment. Only pending or confirmed appointments can be rescheduled.');
      error.statusCode = 400;
      throw error;
    }

    // Check for double booking if date/time changed
    if (updateData.date || updateData.time) {
      const checkDate = updateData.date ? new Date(updateData.date) : appointment.date;
      const checkTime = updateData.time || appointment.time;

      const existingAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctor: appointment.doctor,
        date: checkDate,
        time: checkTime,
        status: { $nin: ['cancelled'] },
      });

      if (existingAppointment) {
        const error = new Error('This time slot is already booked. Please choose another time.');
        error.statusCode = 400;
        throw error;
      }
    }

    // Update allowed fields
    const allowedUpdates = ['date', 'time', 'notes'];
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        appointment[field] = field === 'date' ? new Date(updateData[field]) : updateData[field];
      }
    });

    await appointment.save();

    return await this.getAppointmentById(appointmentId, customerId);
  }

  /**
   * Cancel an appointment
   * @param {string} appointmentId - Appointment's MongoDB ObjectId
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @returns {Object} - Cancelled appointment
   */
  static async cancelAppointment(appointmentId, customerId) {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: customerId,
    });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    // Only allow cancellation for pending or confirmed appointments
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      const error = new Error('Cannot cancel this appointment. Only pending or confirmed appointments can be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return appointment;
  }
}

module.exports = AppointmentService;
