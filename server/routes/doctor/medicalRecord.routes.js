const express = require('express');
const { body } = require('express-validator');
const DoctorMedicalRecordController = require('../../controllers/doctor/medicalRecord.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.get('/', DoctorMedicalRecordController.getMedicalRecords);
router.get('/:id', DoctorMedicalRecordController.getMedicalRecordById);

router.post(
  '/',
  [
    body('appointmentId').notEmpty().isMongoId().withMessage('ID lịch hẹn không hợp lệ'),
    body('diagnosis').notEmpty().trim().isLength({ max: 1000 }).withMessage('Vui lòng nhập chẩn đoán'),
    body('symptoms').optional().trim().isLength({ max: 1000 }),
    body('prescription').optional().trim().isLength({ max: 1000 }),
    body('treatment').optional().trim().isLength({ max: 1000 }),
    body('doctorNotes').optional().trim().isLength({ max: 1000 }),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Chi phí không hợp lệ'),
  ],
  validate,
  DoctorMedicalRecordController.createMedicalRecord
);

router.put(
  '/:id',
  [
    body('diagnosis').optional().trim().isLength({ max: 1000 }),
    body('symptoms').optional().trim().isLength({ max: 1000 }),
    body('prescription').optional().trim().isLength({ max: 1000 }),
    body('treatment').optional().trim().isLength({ max: 1000 }),
    body('doctorNotes').optional().trim().isLength({ max: 1000 }),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Chi phí không hợp lệ'),
  ],
  validate,
  DoctorMedicalRecordController.updateMedicalRecord
);

module.exports = router;
