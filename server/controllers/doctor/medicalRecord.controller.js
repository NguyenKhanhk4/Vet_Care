const DoctorMedicalRecordService = require('../../services/doctor/medicalRecord.service');

class DoctorMedicalRecordController {
  static async getMedicalRecords(req, res, next) {
    try {
      const result = await DoctorMedicalRecordService.getMedicalRecords(req.user._id, req.query, {
        page: req.query.page,
        limit: req.query.limit,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getMedicalRecordById(req, res, next) {
    try {
      const result = await DoctorMedicalRecordService.getMedicalRecordById(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createMedicalRecord(req, res, next) {
    try {
      const result = await DoctorMedicalRecordService.createMedicalRecord(req.user._id, req.body);
      res.status(201).json({ success: true, message: 'Tạo hồ sơ bệnh án thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateMedicalRecord(req, res, next) {
    try {
      const result = await DoctorMedicalRecordService.updateMedicalRecord(req.params.id, req.user._id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật hồ sơ bệnh án thành công', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorMedicalRecordController;
