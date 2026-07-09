const MedicalRecord = require('../../models/MedicalRecord');

/**
 * Medical Record Service - Customer
 * Read-only access to medical records for customers
 */
class MedicalRecordService {
  /**
   * Get all medical records for a customer
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @param {Object} query - { petId, page, limit }
   * @returns {Object} - { records, total, page, pages }
   */
  static async getAllRecords(customerId, query = {}) {
    const { petId, page = 1, limit = 10 } = query;
    const filter = { customer: customerId };

    if (petId) {
      filter.pet = petId;
    }

    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .populate('pet', 'name species breed image')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'date time status')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific medical record by ID
   * @param {string} recordId - Record's MongoDB ObjectId
   * @param {string} customerId - Customer's MongoDB ObjectId
   * @returns {Object} - Medical record data
   */
  static async getRecordById(recordId, customerId) {
    const record = await MedicalRecord.findOne({
      _id: recordId,
      customer: customerId,
    })
      .populate('pet', 'name species breed image gender age weight')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('appointment', 'date time status clinic service');

    if (!record) {
      const error = new Error('Medical record not found');
      error.statusCode = 404;
      throw error;
    }

    return record;
  }
}

module.exports = MedicalRecordService;
