const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');

/**
 * Database Seed Script
 * Populates the database with sample data for development and testing
 * Run: npm run seed
 */

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Clinic.deleteMany({}),
      Doctor.deleteMany({}),
      Service.deleteMany({}),
      Pet.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🗑️ Cleared existing data');

    // ============================================================
    // Create Users
    // ============================================================

    // Admin user (pre-created, no registration needed)
    const adminUser = await User.create({
      name: 'Admin VetCare',
      email: 'admin@vetcare.com',
      password: '123456',
      phone: '0900000000',
      address: 'VetCare Headquarters, TP.HCM',
      role: 'admin',
    });

    // Customer user (for testing)
    const customerUser = await User.create({
      name: 'Nguyen Van An',
      email: 'customer@vetcare.com',
      password: '123456',
      phone: '0901234567',
      address: '123 Nguyen Hue, Quan 1, TP.HCM',
      role: 'customer',
    });

    // Doctor users
    const doctorUser1 = await User.create({
      name: 'Dr. Tran Minh Khoa',
      email: 'doctor1@vetcare.com',
      password: '123456',
      phone: '0912345678',
      role: 'doctor',
    });

    const doctorUser2 = await User.create({
      name: 'Dr. Le Thi Huong',
      email: 'doctor2@vetcare.com',
      password: '123456',
      phone: '0923456789',
      role: 'doctor',
    });

    const doctorUser3 = await User.create({
      name: 'Dr. Pham Duc Anh',
      email: 'doctor3@vetcare.com',
      password: '123456',
      phone: '0934567890',
      role: 'doctor',
    });

    const doctorUser4 = await User.create({
      name: 'Dr. Vo Thi Mai',
      email: 'doctor4@vetcare.com',
      password: '123456',
      phone: '0945678901',
      role: 'doctor',
    });

    const doctorUser5 = await User.create({
      name: 'Dr. Hoang Van Binh',
      email: 'doctor5@vetcare.com',
      password: '123456',
      phone: '0956789012',
      role: 'doctor',
    });

    console.log('👤 Created users');

    // ============================================================
    // Create Clinics
    // ============================================================

    const clinics = await Clinic.insertMany([
      {
        name: 'PetCare Clinic Saigon',
        address: '45 Le Loi, Quan 1, TP.HCM',
        phone: '028 1234 5678',
        email: 'saigon@petcare.vn',
        description: 'Phòng khám thú y hàng đầu tại Sài Gòn với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại. Chuyên điều trị chó, mèo và các loại thú cưng nhỏ.',
        openingHours: '08:00 - 20:00',
        rating: 4.8,
        totalReviews: 156,
        isActive: true,
      },
      {
        name: 'Happy Pet Hospital',
        address: '789 Nguyen Dinh Chieu, Quan 3, TP.HCM',
        phone: '028 2345 6789',
        email: 'info@happypet.vn',
        description: 'Bệnh viện thú y đa khoa với các dịch vụ từ khám tổng quát đến phẫu thuật phức tạp. Có phòng chăm sóc đặc biệt 24/7.',
        openingHours: '07:00 - 22:00',
        rating: 4.6,
        totalReviews: 203,
        isActive: true,
      },
      {
        name: 'VetPlus Animal Clinic',
        address: '156 Cach Mang Thang 8, Quan 10, TP.HCM',
        phone: '028 3456 7890',
        email: 'contact@vetplus.vn',
        description: 'Chuyên khám và điều trị các bệnh về da, tiêm phòng và chăm sóc sức khỏe định kỳ cho thú cưng.',
        openingHours: '08:30 - 18:30',
        rating: 4.5,
        totalReviews: 89,
        isActive: true,
      },
      {
        name: 'Golden Paws Veterinary',
        address: '23 Pham Van Dong, Thu Duc, TP.HCM',
        phone: '028 4567 8901',
        email: 'hello@goldenpaws.vn',
        description: 'Phòng khám chuyên về chăm sóc sức khỏe răng miệng và grooming cho thú cưng. Dịch vụ tắm rửa, cắt tỉa lông chuyên nghiệp.',
        openingHours: '09:00 - 19:00',
        rating: 4.7,
        totalReviews: 124,
        isActive: true,
      },
      {
        name: 'SaiGon Pet Emergency Center',
        address: '567 Dien Bien Phu, Binh Thanh, TP.HCM',
        phone: '028 5678 9012',
        email: 'emergency@sgpet.vn',
        description: 'Trung tâm cấp cứu thú y hoạt động 24/7. Chuyên xử lý các trường hợp khẩn cấp và phẫu thuật cấp cứu.',
        openingHours: '24/7',
        rating: 4.9,
        totalReviews: 312,
        isActive: true,
      },
    ]);

    console.log('🏥 Created clinics');

    // ============================================================
    // Create Doctors
    // ============================================================

    const defaultSlots = [
      { day: 'monday', startTime: '08:00', endTime: '17:00' },
      { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
      { day: 'thursday', startTime: '08:00', endTime: '17:00' },
      { day: 'friday', startTime: '08:00', endTime: '17:00' },
      { day: 'saturday', startTime: '09:00', endTime: '13:00' },
    ];

    const doctors = await Doctor.insertMany([
      {
        user: doctorUser1._id,
        clinic: clinics[0]._id,
        specialization: 'Internal Medicine & Surgery',
        experience: 12,
        bio: 'Bác sĩ Khoa có hơn 12 năm kinh nghiệm trong lĩnh vực nội khoa và phẫu thuật thú y. Tốt nghiệp Đại học Nông Lâm TP.HCM.',
        rating: 4.8,
        totalReviews: 45,
        availableSlots: defaultSlots,
        isActive: true,
      },
      {
        user: doctorUser2._id,
        clinic: clinics[0]._id,
        specialization: 'Dermatology & Allergy',
        experience: 8,
        bio: 'Chuyên gia về da liễu và dị ứng thú y. Đã điều trị thành công hàng nghìn ca bệnh về da cho chó mèo.',
        rating: 4.7,
        totalReviews: 38,
        availableSlots: defaultSlots,
        isActive: true,
      },
      {
        user: doctorUser3._id,
        clinic: clinics[1]._id,
        specialization: 'Orthopedics & Rehabilitation',
        experience: 15,
        bio: 'Bác sĩ Anh chuyên về chỉnh hình và phục hồi chức năng. Có kinh nghiệm phẫu thuật xương khớp cho các giống chó lớn.',
        rating: 4.9,
        totalReviews: 62,
        availableSlots: defaultSlots,
        isActive: true,
      },
      {
        user: doctorUser4._id,
        clinic: clinics[2]._id,
        specialization: 'Vaccination & Preventive Care',
        experience: 6,
        bio: 'Chuyên về tiêm phòng và chăm sóc sức khỏe dự phòng. Tận tâm với từng bệnh nhân nhỏ.',
        rating: 4.6,
        totalReviews: 29,
        availableSlots: defaultSlots,
        isActive: true,
      },
      {
        user: doctorUser5._id,
        clinic: clinics[3]._id,
        specialization: 'Dental Care & Surgery',
        experience: 10,
        bio: 'Chuyên gia nha khoa thú y hàng đầu. Điều trị các vấn đề răng miệng từ đơn giản đến phức tạp.',
        rating: 4.7,
        totalReviews: 41,
        availableSlots: defaultSlots,
        isActive: true,
      },
    ]);

    console.log('👨‍⚕️ Created doctors');

    // ============================================================
    // Create Services
    // ============================================================

    const services = await Service.insertMany([
      // Clinic 1 Services
      {
        name: 'Khám tổng quát',
        description: 'Khám sức khỏe tổng quát cho thú cưng bao gồm kiểm tra tim, phổi, mắt, tai, răng và da.',
        price: 200000,
        duration: 30,
        clinic: clinics[0]._id,
        category: 'checkup',
        isActive: true,
      },
      {
        name: 'Tiêm phòng dại',
        description: 'Tiêm vaccine phòng bệnh dại cho chó mèo. Bao gồm khám sức khỏe trước tiêm.',
        price: 150000,
        duration: 15,
        clinic: clinics[0]._id,
        category: 'vaccination',
        isActive: true,
      },
      {
        name: 'Tiêm phòng 5 bệnh',
        description: 'Vaccine phòng 5 bệnh nguy hiểm: Parvo, Distemper, Hepatitis, Parainfluenza, Leptospirosis.',
        price: 350000,
        duration: 20,
        clinic: clinics[0]._id,
        category: 'vaccination',
        isActive: true,
      },
      {
        name: 'Phẫu thuật triệt sản',
        description: 'Phẫu thuật triệt sản an toàn với gây mê chuyên nghiệp. Bao gồm thuốc hậu phẫu.',
        price: 1500000,
        duration: 120,
        clinic: clinics[0]._id,
        category: 'surgery',
        isActive: true,
      },
      // Clinic 2 Services
      {
        name: 'Khám nội khoa',
        description: 'Khám và điều trị các bệnh nội khoa: tiêu hóa, hô hấp, tiết niệu.',
        price: 250000,
        duration: 45,
        clinic: clinics[1]._id,
        category: 'checkup',
        isActive: true,
      },
      {
        name: 'Xét nghiệm máu',
        description: 'Xét nghiệm máu toàn phần để đánh giá sức khỏe tổng thể. Kết quả trong 30 phút.',
        price: 400000,
        duration: 30,
        clinic: clinics[1]._id,
        category: 'laboratory',
        isActive: true,
      },
      {
        name: 'Chụp X-Quang',
        description: 'Chụp X-Quang kỹ thuật số để chẩn đoán các vấn đề về xương, khớp và nội tạng.',
        price: 500000,
        duration: 30,
        clinic: clinics[1]._id,
        category: 'laboratory',
        isActive: true,
      },
      // Clinic 3 Services
      {
        name: 'Điều trị da liễu',
        description: 'Khám và điều trị các bệnh về da: nấm, ghẻ, viêm da dị ứng, rụng lông.',
        price: 300000,
        duration: 40,
        clinic: clinics[2]._id,
        category: 'checkup',
        isActive: true,
      },
      {
        name: 'Tiêm phòng tổng hợp mèo',
        description: 'Vaccine phòng 3 bệnh cho mèo: Feline Panleukopenia, Calicivirus, Rhinotracheitis.',
        price: 300000,
        duration: 20,
        clinic: clinics[2]._id,
        category: 'vaccination',
        isActive: true,
      },
      // Clinic 4 Services
      {
        name: 'Cạo vôi răng',
        description: 'Cạo vôi răng và đánh bóng cho thú cưng dưới gây mê nhẹ.',
        price: 800000,
        duration: 60,
        clinic: clinics[3]._id,
        category: 'dental',
        isActive: true,
      },
      {
        name: 'Tắm & Grooming',
        description: 'Dịch vụ tắm, sấy, cắt tỉa lông chuyên nghiệp. Bao gồm vệ sinh tai, cắt móng.',
        price: 250000,
        duration: 90,
        clinic: clinics[3]._id,
        category: 'grooming',
        isActive: true,
      },
      {
        name: 'Nhổ răng',
        description: 'Phẫu thuật nhổ răng sữa hoặc răng hư cho thú cưng dưới gây mê.',
        price: 600000,
        duration: 45,
        clinic: clinics[3]._id,
        category: 'dental',
        isActive: true,
      },
      // Clinic 5 Services
      {
        name: 'Cấp cứu thú y',
        description: 'Dịch vụ cấp cứu 24/7 cho các trường hợp khẩn cấp: ngộ độc, tai nạn, khó thở.',
        price: 500000,
        duration: 60,
        clinic: clinics[4]._id,
        category: 'emergency',
        isActive: true,
      },
      {
        name: 'Phẫu thuật cấp cứu',
        description: 'Phẫu thuật khẩn cấp cho các trường hợp nguy hiểm tính mạng.',
        price: 3000000,
        duration: 180,
        clinic: clinics[4]._id,
        category: 'surgery',
        isActive: true,
      },
    ]);

    console.log('🏷️ Created services');

    // ============================================================
    // Create Sample Pets for Customer
    // ============================================================

    const pets = await Pet.insertMany([
      {
        owner: customerUser._id,
        name: 'Lucky',
        species: 'dog',
        breed: 'Golden Retriever',
        gender: 'male',
        age: 3,
        weight: 28,
        color: 'Vàng',
        vaccineStatus: 'up-to-date',
      },
      {
        owner: customerUser._id,
        name: 'Miu',
        species: 'cat',
        breed: 'British Shorthair',
        gender: 'female',
        age: 2,
        weight: 4.5,
        color: 'Xám xanh',
        vaccineStatus: 'up-to-date',
      },
    ]);

    console.log('🐾 Created sample pets');

    // ============================================================
    // Create Sample Appointment
    // ============================================================

    const sampleAppointment = await Appointment.create({
      customer: customerUser._id,
      pet: pets[0]._id,
      clinic: clinics[0]._id,
      doctor: doctors[0]._id,
      service: services[0]._id,
      date: new Date('2026-07-15'),
      time: '10:00',
      status: 'confirmed',
      totalAmount: services[0].price,
      notes: 'Khám sức khỏe định kỳ cho Lucky',
    });

    // Create sample completed appointment
    const completedAppointment = await Appointment.create({
      customer: customerUser._id,
      pet: pets[1]._id,
      clinic: clinics[0]._id,
      doctor: doctors[1]._id,
      service: services[1]._id,
      date: new Date('2026-07-01'),
      time: '14:00',
      status: 'completed',
      totalAmount: services[1].price,
      notes: 'Tiêm phòng dại cho Miu',
    });

    console.log('📅 Created sample appointments');

    // ============================================================
    // Create Sample Medical Record
    // ============================================================

    await MedicalRecord.create({
      appointment: completedAppointment._id,
      pet: pets[1]._id,
      doctor: doctors[1]._id,
      customer: customerUser._id,
      diagnosis: 'Sức khỏe tốt, đủ điều kiện tiêm phòng',
      symptoms: 'Không có triệu chứng bất thường',
      prescription: 'Vaccine phòng dại Nobivac Rabies 1ml',
      doctorNotes: 'Mèo khỏe mạnh, tiêm phòng dại thành công. Hẹn tái khám sau 1 năm.',
      cost: 150000,
      date: new Date('2026-07-01'),
    });

    console.log('📋 Created sample medical records');

    // ============================================================
    // Create Sample Notifications
    // ============================================================

    await Notification.insertMany([
      {
        user: customerUser._id,
        title: 'Chào mừng đến VetCare!',
        message: 'Cảm ơn bạn đã đăng ký VetCare. Hãy thêm thú cưng và đặt lịch khám ngay!',
        type: 'booking',
        isRead: true,
      },
      {
        user: customerUser._id,
        title: 'Lịch hẹn được xác nhận',
        message: 'Lịch khám cho Lucky tại PetCare Clinic Saigon ngày 15/07/2026 lúc 10:00 đã được xác nhận.',
        type: 'booking',
        isRead: false,
        relatedId: sampleAppointment._id,
      },
      {
        user: customerUser._id,
        title: 'Khám hoàn thành',
        message: 'Buổi tiêm phòng cho Miu đã hoàn thành. Hãy xem hồ sơ khám bệnh.',
        type: 'completion',
        isRead: false,
        relatedId: completedAppointment._id,
      },
      {
        user: customerUser._id,
        title: 'Nhắc nhở lịch khám',
        message: 'Bạn có lịch khám cho Lucky vào ngày 15/07/2026. Đừng quên nhé!',
        type: 'reminder',
        isRead: false,
        relatedId: sampleAppointment._id,
      },
    ]);

    console.log('🔔 Created sample notifications');

    // ============================================================
    // Summary
    // ============================================================

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log(`📊 Summary:`);
    console.log(`   - Users: 7 (1 admin + 1 customer + 5 doctors)`);
    console.log(`   - Clinics: 5`);
    console.log(`   - Doctors: 5`);
    console.log(`   - Services: 14`);
    console.log(`   - Pets: 2`);
    console.log(`   - Appointments: 2`);
    console.log(`   - Medical Records: 1`);
    console.log(`   - Notifications: 4`);
    console.log('\n📧 Test Login:');
    console.log(`   Admin:    admin@vetcare.com / 123456`);
    console.log(`   Customer: customer@vetcare.com / 123456`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
