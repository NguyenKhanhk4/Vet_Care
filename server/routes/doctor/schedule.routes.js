const express = require('express');
const DoctorScheduleController = require('../../controllers/doctor/schedule.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.get('/today', DoctorScheduleController.getTodaySchedule);
router.get('/week', DoctorScheduleController.getWeeklySchedule);
router.post('/time-off', DoctorScheduleController.addTimeOff);
router.delete('/time-off/:date', DoctorScheduleController.removeTimeOff);

module.exports = router;
