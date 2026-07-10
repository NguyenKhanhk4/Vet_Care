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
const vaccinationRoutes = require('./routes/customer/vaccination.routes');

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
app.use(`${API_PREFIX}/vaccinations`, vaccinationRoutes);

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
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/customer`);
});

module.exports = app;
