const Doctor = require('../../models/Doctor');
const MedicalRecord = require('../../models/MedicalRecord');
const Appointment = require('../../models/Appointment');

class DoctorMedicalRecordService {
  static async getMedicalRecords(userId, filters = {}, pagination = {}) {
    const doctor = await DoctorMedicalRecordService._getDoctorByUserId(userId);

    const query = { doctor: doctor._id };
    if (filters.petId) query.pet = filters.petId;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      MedicalRecord.find(query)
        .populate('pet', 'name species breed age image')
        .populate('customer', 'name email phone')
        .populate('appointment', 'date time status')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      MedicalRecord.countDocuments(query),
    ]);

    return { records, total, page, pages: Math.ceil(total / limit) };
  }

  static async getMedicalRecordById(recordId, userId) {
    const doctor = await DoctorMedicalRecordService._getDoctorByUserId(userId);

    const record = await MedicalRecord.findOne({ _id: recordId, doctor: doctor._id })
      .populate('pet', 'name species breed age gender weight color image vaccineStatus')
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'appointment',
        select: 'date time status notes totalAmount',
        populate: { path: 'service', select: 'name price' },
      });

    if (!record) {
      const error = new Error('Không tìm thấy hồ sơ bệnh án');
      error.statusCode = 404;
      throw error;
    }

    return record;
  }

  static async createMedicalRecord(userId, data) {
    const doctor = await DoctorMedicalRecordService._getDoctorByUserId(userId);

    const { appointmentId, diagnosis, symptoms, prescription, treatment, doctorNotes, cost } = data;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctor._id,
    });

    if (!appointment) {
      const error = new Error('Không tìm thấy lịch hẹn hoặc lịch hẹn không thuộc về bạn');
      error.statusCode = 404;
      throw error;
    }

    if (appointment.status !== 'completed') {
      const error = new Error('Chỉ có thể tạo hồ sơ bệnh án cho lịch hẹn đã hoàn thành');
      error.statusCode = 400;
      throw error;
    }

    const existing = await MedicalRecord.findOne({ appointment: appointmentId });
    if (existing) {
      const error = new Error('Hồ sơ bệnh án cho lịch hẹn này đã tồn tại');
      error.statusCode = 400;
      throw error;
    }

    const record = await MedicalRecord.create({
      appointment: appointmentId,
      pet: appointment.pet,
      doctor: doctor._id,
      customer: appointment.customer,
      diagnosis,
      symptoms: symptoms || '',
      prescription: prescription || '',
      treatment: treatment || '',
      doctorNotes: doctorNotes || '',
      cost: cost || 0,
      date: appointment.date,
    });

    await record.populate([
      { path: 'pet', select: 'name species breed age image' },
      { path: 'customer', select: 'name email phone' },
    ]);

    return record;
  }

  static async updateMedicalRecord(recordId, userId, updateData) {
    const doctor = await DoctorMedicalRecordService._getDoctorByUserId(userId);

    const { diagnosis, symptoms, prescription, treatment, doctorNotes, cost } = updateData;

    const record = await MedicalRecord.findOne({ _id: recordId, doctor: doctor._id });
    if (!record) {
      const error = new Error('Không tìm thấy hồ sơ bệnh án');
      error.statusCode = 404;
      throw error;
    }

    const EDIT_WINDOW_HOURS = 24;
    const createdAt = new Date(record.createdAt).getTime();
    const now = new Date().getTime();
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

    if (hoursSinceCreation > EDIT_WINDOW_HOURS) {
      const error = new Error('Đã quá hạn 24 giờ để chỉnh sửa hồ sơ bệnh án');
      error.statusCode = 403;
      throw error;
    }

    if (diagnosis !== undefined) record.diagnosis = diagnosis;
    if (symptoms !== undefined) record.symptoms = symptoms;
    if (prescription !== undefined) record.prescription = prescription;
    if (treatment !== undefined) record.treatment = treatment;
    if (doctorNotes !== undefined) record.doctorNotes = doctorNotes;
    if (cost !== undefined) record.cost = cost;

    await record.save();

    await record.populate([
      { path: 'pet', select: 'name species breed age image' },
      { path: 'customer', select: 'name email phone' },
    ]);

    return record;
  }

  static async _getDoctorByUserId(userId) {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      const error = new Error('Không tìm thấy hồ sơ bác sĩ');
      error.statusCode = 404;
      throw error;
    }
    return doctor;
  }
}

module.exports = DoctorMedicalRecordService;
