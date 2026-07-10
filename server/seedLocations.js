require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Clinic = require('./models/Clinic');

// Tọa độ trung tâm (Ví dụ: Quận 1, TP.HCM)
const CENTER_LAT = 10.7769;
const CENTER_LNG = 106.7009;

// Hàm tạo khoảng lệch ngẫu nhiên (tương đương vài km)
const randomOffset = () => (Math.random() - 0.5) * 0.05;

const seedLocations = async () => {
  try {
    await connectDB();
    
    console.log('Fetching clinics...');
    const clinics = await Clinic.find();
    
    if (clinics.length === 0) {
      console.log('No clinics found in the database. Please add a clinic first.');
      process.exit(0);
    }
    
    let updatedCount = 0;
    
    for (const clinic of clinics) {
      // Nếu chưa có tọa độ hoặc muốn làm mới
      clinic.latitude = CENTER_LAT + randomOffset();
      clinic.longitude = CENTER_LNG + randomOffset();
      await clinic.save();
      updatedCount++;
    }
    
    console.log(`✅ Successfully updated ${updatedCount} clinics with random GPS coordinates.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    process.exit(1);
  }
};

seedLocations();
