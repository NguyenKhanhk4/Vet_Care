const Clinic = require('../../models/Clinic');
const { createAccentInsensitiveRegex } = require('../../utils/stringUtils');

/**
 * Clinic Service - Customer
 * Read-only access to clinic data for customers
 */
class ClinicService {
  /**
   * Get all active clinics with optional search
   * @param {Object} query - { search, page, limit }
   * @returns {Object} - { clinics, total, page, pages }
   */
  static async getAllClinics(query = {}) {
    const { search, page = 1, limit = 10 } = query;
    const filter = { isActive: true };

    // Search by name only
    if (search) {
      const regexPattern = createAccentInsensitiveRegex(search);
      filter.name = { $regex: regexPattern, $options: 'i' };
    }

    const total = await Clinic.countDocuments(filter);
    const clinics = await Clinic.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      clinics,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific clinic by ID
   * @param {string} clinicId - Clinic's MongoDB ObjectId
   * @returns {Object} - Clinic data
   */
  static async getClinicById(clinicId) {
    const clinic = await Clinic.findOne({ _id: clinicId, isActive: true });

    if (!clinic) {
      const error = new Error('Clinic not found');
      error.statusCode = 404;
      throw error;
    }

    return clinic;
  }
}

module.exports = ClinicService;
