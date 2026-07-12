const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorMiddleware = require('./middlewares/error.middleware');

// Import Customer Routes
const authRoutes = require('./routes/customer/auth.routes');
const profileRoutes = require('./routes/customer/profile.routes');
const petRoutes = require('./routes/customer/pet.routes');
const clinicRoutes = require('./routes/customer/clinic.routes');
const doctorRoutes = require('./routes/customer/doctor.routes');
const serviceRoutes = require('./routes/customer/service.routes');
const appointmentRoutes = require('./routes/customer/appointment.routes');
const medicalRecordRoutes = require('./routes/customer/medicalRecord.routes');
const paymentRoutes = require('./routes/customer/payment.routes');
const notificationRoutes = require('./routes/customer/notification.routes');
const reviewRoutes = require('./routes/customer/review.routes');

// Import Doctor Routes
const doctorAuthRoutes = require('./routes/doctor/auth.routes');
const doctorProfileRoutes = require('./routes/doctor/profile.routes');
const doctorAppointmentRoutes = require('./routes/doctor/appointment.routes');
const doctorMedicalRecordRoutes = require('./routes/doctor/medicalRecord.routes');
const doctorScheduleRoutes = require('./routes/doctor/schedule.routes');
const doctorNotificationRoutes = require('./routes/doctor/notification.routes');
// Import Shared Routes
const sharedAuthRoutes = require('./routes/shared/auth.routes');
const sharedPaymentRoutes = require('./routes/shared/payment.routes');

// Import Admin Routes
const adminAuthRoutes = require('./routes/admin/auth.routes');
const adminDashboardRoutes = require('./routes/admin/dashboard.routes');
const adminUserRoutes = require('./routes/admin/user.routes');
const adminDoctorRoutes = require('./routes/admin/doctor.routes');
const adminClinicRoutes = require('./routes/admin/clinic.routes');
const adminServiceRoutes = require('./routes/admin/service.routes');
const adminAppointmentRoutes = require('./routes/admin/appointment.routes');
const adminPaymentRoutes = require('./routes/admin/payment.routes');
const adminReviewRoutes = require('./routes/admin/review.routes');
const adminReportRoutes = require('./routes/admin/report.routes');
const adminProfileRoutes = require('./routes/admin/profile.routes');
const adminNotificationRoutes = require('./routes/admin/notification.routes');
const adminPetRoutes = require('./routes/admin/pet.routes');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// ============================================================
// Middleware Configuration
// ============================================================

// Enable CORS for all origins (development)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// API Routes - Shared Role
// ============================================================

app.use('/api/auth', sharedAuthRoutes);
app.use('/api/payment', sharedPaymentRoutes);

// ============================================================
// API Routes - Customer Role
// ============================================================

const API_PREFIX = '/api/customer';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, profileRoutes);
app.use(`${API_PREFIX}/pets`, petRoutes);
app.use(`${API_PREFIX}/clinics`, clinicRoutes);
app.use(`${API_PREFIX}/doctors`, doctorRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
app.use(`${API_PREFIX}/medical-records`, medicalRecordRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);

// ============================================================
// API Routes - Doctor Role
// ============================================================

const DOCTOR_API_PREFIX = '/api/doctor';

app.use(`${DOCTOR_API_PREFIX}/auth`, doctorAuthRoutes);
app.use(`${DOCTOR_API_PREFIX}/profile`, doctorProfileRoutes);
app.use(`${DOCTOR_API_PREFIX}/appointments`, doctorAppointmentRoutes);
app.use(`${DOCTOR_API_PREFIX}/medical-records`, doctorMedicalRecordRoutes);
app.use(`${DOCTOR_API_PREFIX}/schedules`, doctorScheduleRoutes);
app.use(`${DOCTOR_API_PREFIX}/notifications`, doctorNotificationRoutes);
// API Routes - Admin Role
// ============================================================

const ADMIN_PREFIX = '/api/admin';

app.use(`${ADMIN_PREFIX}/auth`, adminAuthRoutes);
app.use(`${ADMIN_PREFIX}/dashboard`, adminDashboardRoutes);
app.use(`${ADMIN_PREFIX}/users`, adminUserRoutes);
app.use(`${ADMIN_PREFIX}/doctors`, adminDoctorRoutes);
app.use(`${ADMIN_PREFIX}/clinics`, adminClinicRoutes);
app.use(`${ADMIN_PREFIX}/services`, adminServiceRoutes);
app.use(`${ADMIN_PREFIX}/appointments`, adminAppointmentRoutes);
app.use(`${ADMIN_PREFIX}/payments`, adminPaymentRoutes);
app.use(`${ADMIN_PREFIX}/reviews`, adminReviewRoutes);
app.use(`${ADMIN_PREFIX}/reports`, adminReportRoutes);
app.use(`${ADMIN_PREFIX}/profile`, adminProfileRoutes);
app.use(`${ADMIN_PREFIX}/notifications`, adminNotificationRoutes);
app.use(`${ADMIN_PREFIX}/pets`, adminPetRoutes);

// ============================================================
// Health Check Endpoint
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VetCare API is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 404 Handler - Route Not Found
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
// Global Error Handler
// ============================================================

app.use(errorMiddleware);

// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 VetCare Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Customer API: http://localhost:${PORT}/api/customer`);
  console.log(`🔗 Doctor API:   http://localhost:${PORT}/api/doctor`);
  console.log(`🔗 Admin API: http://localhost:${PORT}/api/admin`);
});

module.exports = app;
