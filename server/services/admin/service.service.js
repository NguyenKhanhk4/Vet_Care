const Service = require('../../models/Service');

/**
 * Service Management Service - Admin
 * Handles CRUD operations for veterinary services
 */
class AdminServiceService {
  /**
   * Get all services with pagination and search
   * @param {Object} query - { page, limit, search, category, clinicId }
   * @returns {Object} - { services, pagination }
   */
  static async getAllServices(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.clinicId) {
      filter.clinic = query.clinicId;
    }

    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate('clinic', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(filter),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get service by ID
   * @param {string} serviceId
   * @returns {Object} service
   */
  static async getServiceById(serviceId) {
    const service = await Service.findById(serviceId)
      .populate('clinic', 'name address')
      .lean();

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    return service;
  }

  /**
   * Create a new service
   * @param {Object} data
   * @returns {Object} created service
   */
  static async createService(data) {
    const service = await Service.create(data);
    return await Service.findById(service._id).populate('clinic', 'name address');
  }

  /**
   * Update service
   * @param {string} serviceId
   * @param {Object} updateData
   * @returns {Object} updated service
   */
  static async updateService(serviceId, updateData) {
    const service = await Service.findByIdAndUpdate(serviceId, updateData, {
      new: true,
      runValidators: true,
    }).populate('clinic', 'name address');

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    return service;
  }

  /**
   * Delete service
   * @param {string} serviceId
   */
  static async deleteService(serviceId) {
    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      const error = new Error('Service not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Service deleted successfully' };
  }
}

module.exports = AdminServiceService;
