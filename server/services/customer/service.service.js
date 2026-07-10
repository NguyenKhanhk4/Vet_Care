const Service = require('../../models/Service');
const { createAccentInsensitiveRegex } = require('../../utils/stringUtils');

/**
 * Service Service - Customer
 * Read-only access to veterinary services for customers
 */
class ServiceService {
  /**
   * Get all active services with optional filters
   * @param {Object} query - { clinicId, category, search, page, limit }
   * @returns {Object} - { services, total, page, pages }
   */
  static async getAllServices(query = {}) {
    const { clinicId, category, search, page = 1, limit = 10 } = query;
    const filter = { isActive: true };

    // Filter by clinic
    if (clinicId) {
      filter.clinic = clinicId;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search by name only
    if (search) {
      const regexPattern = createAccentInsensitiveRegex(search);
      filter.name = { $regex: regexPattern, $options: 'i' };
    }

    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .populate('clinic', 'name address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      services,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific service by ID
   * @param {string} serviceId - Service's MongoDB ObjectId
   * @returns {Object} - Service data with populated clinic
   */
  static async getServiceById(serviceId) {
    const service = await Service.findOne({ _id: serviceId, isActive: true })
      .populate('clinic', 'name address phone');

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    return service;
  }
}

module.exports = ServiceService;
