const Clinic = require('../../models/Clinic');

/**
 * Clinic Management Service - Admin
 * Handles CRUD operations for clinics
 */
class AdminClinicService {
  /**
   * Get all clinics with pagination and search
   * @param {Object} query - { page, limit, search }
   * @returns {Object} - { clinics, pagination }
   */
  static async getAllClinics(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { address: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [clinics, total] = await Promise.all([
      Clinic.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Clinic.countDocuments(filter),
    ]);

    return {
      clinics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get clinic by ID
   * @param {string} clinicId
   * @returns {Object} clinic
   */
  static async getClinicById(clinicId) {
    const clinic = await Clinic.findById(clinicId).lean();

    if (!clinic) {
      const error = new Error('Clinic not found');
      error.statusCode = 404;
      throw error;
    }

    return clinic;
  }

  /**
   * Create a new clinic
   * @param {Object} data
   * @returns {Object} created clinic
   */
  static async createClinic(data) {
    const clinic = await Clinic.create(data);
    return clinic;
  }

  /**
   * Update clinic
   * @param {string} clinicId
   * @param {Object} updateData
   * @returns {Object} updated clinic
   */
  static async updateClinic(clinicId, updateData) {
    const clinic = await Clinic.findByIdAndUpdate(clinicId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!clinic) {
      const error = new Error('Clinic not found');
      error.statusCode = 404;
      throw error;
    }

    return clinic;
  }

  /**
   * Delete clinic
   * @param {string} clinicId
   */
  static async deleteClinic(clinicId) {
    const clinic = await Clinic.findByIdAndDelete(clinicId);

    if (!clinic) {
      const error = new Error('Clinic not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Clinic deleted successfully' };
  }
}

module.exports = AdminClinicService;
