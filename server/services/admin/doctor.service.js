const User = require('../../models/User');
const Doctor = require('../../models/Doctor');

/**
 * Doctor Management Service - Admin
 * Handles CRUD operations for doctor accounts and profiles
 */
class AdminDoctorService {
  /**
   * Get all doctors with pagination and search
   * @param {Object} query - { page, limit, search }
   * @returns {Object} - { doctors, pagination }
   */
  static async getAllDoctors(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.search) {
      // We need to search by user name, so use a pipeline
      const matchingUsers = await User.find({
        role: 'doctor',
        $or: [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.$or = [
        { user: { $in: userIds } },
        { specialization: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate('user', 'name email phone avatar')
        .populate('clinic', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    return {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get doctor by ID
   * @param {string} doctorId
   * @returns {Object} doctor
   */
  static async getDoctorById(doctorId) {
    const doctor = await Doctor.findById(doctorId)
      .populate('user', 'name email phone avatar address')
      .populate('clinic', 'name address phone')
      .lean();

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    return doctor;
  }

  /**
   * Create a new doctor (creates User + Doctor profile)
   * @param {Object} data - { name, email, password, phone, clinicId, specialization, experience, bio }
   * @returns {Object} created doctor
   */
  static async createDoctor(data) {
    const { name, email, password, phone, clinicId, specialization, experience, bio } = data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    // Create user account with doctor role
    const user = await User.create({
      name,
      email,
      password: password || '123456',
      phone,
      role: 'doctor',
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      clinic: clinicId,
      specialization,
      experience: experience || 0,
      bio: bio || '',
      availableSlots: [
        { day: 'monday', startTime: '08:00', endTime: '17:00' },
        { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
        { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
        { day: 'thursday', startTime: '08:00', endTime: '17:00' },
        { day: 'friday', startTime: '08:00', endTime: '17:00' },
        { day: 'saturday', startTime: '09:00', endTime: '13:00' },
      ],
    });

    // Return populated doctor
    return await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('clinic', 'name address');
  }

  /**
   * Update doctor information
   * @param {string} doctorId
   * @param {Object} updateData
   * @returns {Object} updated doctor
   */
  static async updateDoctor(doctorId, updateData) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    // Update user info if provided
    if (updateData.name || updateData.email || updateData.phone) {
      const userUpdate = {};
      if (updateData.name) userUpdate.name = updateData.name;
      if (updateData.email) userUpdate.email = updateData.email;
      if (updateData.phone) userUpdate.phone = updateData.phone;

      await User.findByIdAndUpdate(doctor.user, userUpdate, { runValidators: true });
    }

    // Update doctor profile fields
    const doctorUpdate = {};
    if (updateData.specialization) doctorUpdate.specialization = updateData.specialization;
    if (updateData.experience !== undefined) doctorUpdate.experience = updateData.experience;
    if (updateData.bio !== undefined) doctorUpdate.bio = updateData.bio;
    if (updateData.clinicId) doctorUpdate.clinic = updateData.clinicId;
    if (updateData.isActive !== undefined) doctorUpdate.isActive = updateData.isActive;
    if (updateData.availableSlots) doctorUpdate.availableSlots = updateData.availableSlots;

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, doctorUpdate, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email phone avatar')
      .populate('clinic', 'name address');

    return updatedDoctor;
  }

  /**
   * Delete doctor (removes both Doctor profile and User account)
   * @param {string} doctorId
   */
  static async deleteDoctor(doctorId) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete doctor profile and user account
    await Promise.all([
      Doctor.findByIdAndDelete(doctorId),
      User.findByIdAndDelete(doctor.user),
    ]);

    return { message: 'Doctor deleted successfully' };
  }
}

module.exports = AdminDoctorService;
