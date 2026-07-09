const Doctor = require('../../models/Doctor');

/**
 * Doctor Service - Customer
 * Read-only access to doctor data for customers
 */
class DoctorService {
  /**
   * Get all active doctors with optional filters
   * @param {Object} query - { clinicId, search, page, limit }
   * @returns {Object} - { doctors, total, page, pages }
   */
  static async getAllDoctors(query = {}) {
    const { clinicId, search, page = 1, limit = 10 } = query;
    const filter = { isActive: true };

    // Filter by clinic
    if (clinicId) {
      filter.clinic = clinicId;
    }

    const total = await Doctor.countDocuments(filter);
    let doctorsQuery = Doctor.find(filter)
      .populate('user', 'name email avatar')
      .populate('clinic', 'name address')
      .sort({ rating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const doctors = await doctorsQuery;

    // Filter by search term (doctor name from populated user)
    let filteredDoctors = doctors;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDoctors = doctors.filter(
        (doc) =>
          doc.user?.name?.toLowerCase().includes(searchLower) ||
          doc.specialization?.toLowerCase().includes(searchLower)
      );
    }

    return {
      doctors: filteredDoctors,
      total: search ? filteredDoctors.length : total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific doctor by ID
   * @param {string} doctorId - Doctor's MongoDB ObjectId
   * @returns {Object} - Doctor data with populated user and clinic
   */
  static async getDoctorById(doctorId) {
    const doctor = await Doctor.findOne({ _id: doctorId, isActive: true })
      .populate('user', 'name email phone avatar')
      .populate('clinic', 'name address phone');

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    return doctor;
  }
}

module.exports = DoctorService;
