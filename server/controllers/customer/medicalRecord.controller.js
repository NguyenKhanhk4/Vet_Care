const MedicalRecordService = require('../../services/customer/medicalRecord.service');

/**
 * Medical Record Controller - Customer
 * Read-only access to medical records
 */
class MedicalRecordController {
  /**
   * GET /api/customer/medical-records
   */
  static async getAllRecords(req, res, next) {
    try {
      const result = await MedicalRecordService.getAllRecords(req.user._id, req.query);

      res.status(200).json({
        success: true,
        count: result.records.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.records,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/medical-records/:id
   */
  static async getRecordById(req, res, next) {
    try {
      const record = await MedicalRecordService.getRecordById(req.params.id, req.user._id);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MedicalRecordController;
