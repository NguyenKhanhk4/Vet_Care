const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Pet = require('../models/Pet');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const MedicalRecord = require('../models/MedicalRecord');
const Review = require('../models/Review');
const Vaccination = require('../models/Vaccination');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vetcare';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Delete all existing data
    console.log('Clearing all existing data...');
    await User.deleteMany({});
    await Clinic.deleteMany({});
    await Pet.deleteMany({});
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Review.deleteMany({});
    await Vaccination.deleteMany({});
    await Notification.deleteMany({});

    // 2. Create Users
    console.log('Creating users (Admins, Customers, Doctors)...');
    const users = [];
    
    // Admins
    users.push(await User.create({ name: 'Admin One', email: 'admin1@vetcare.com', password: '123456', role: 'admin', phone: '0901000001' }));
    users.push(await User.create({ name: 'Admin Two', email: 'admin2@vetcare.com', password: '123456', role: 'admin', phone: '0901000002' }));
    
    // Customers (15 customers)
    const customers = [];
    for (let i = 1; i <= 15; i++) {
      const c = await User.create({ name: `Khách Hàng ${i}`, email: `customer${i}@vetcare.com`, password: '123456', role: 'customer', phone: `09110000${i.toString().padStart(2, '0')}` });
      users.push(c);
      customers.push(c);
    }
    
    // Doctor Users (10 doctors)
    const doctorUsers = [];
    for (let i = 1; i <= 10; i++) {
      const d = await User.create({ name: `Bác Sĩ ${i}`, email: `doctor${i}@vetcare.com`, password: '123456', role: 'doctor', phone: `09210000${i.toString().padStart(2, '0')}` });
      users.push(d);
      doctorUsers.push(d);
    }

    // 3. Create Clinics (5 Clinics)
    console.log('Creating clinics...');
    const clinics = [];
    for (let i = 1; i <= 5; i++) {
      clinics.push(await Clinic.create({
        name: `Phòng khám Thú y VetCare Cơ sở ${i}`,
        address: `${i}00 Nguyễn Văn Cừ, Quận ${i}, TP.HCM`,
        phone: `090900000${i}`,
        description: 'Phòng khám thú y hiện đại, uy tín với đội ngũ bác sĩ chuyên môn cao.',
        latitude: 10.762622 + (i * 0.01),
        longitude: 106.660172 + (i * 0.01),
        rating: 4 + (i * 0.1),
        totalReviews: i * 15
      }));
    }

    // 4. Create Pets (15 Pets)
    console.log('Creating pets...');
    const pets = [];
    const speciesList = ['dog', 'cat', 'bird', 'rabbit', 'hamster'];
    for (let i = 0; i < 15; i++) {
      pets.push(await Pet.create({
        owner: customers[i]._id,
        name: `Thú cưng ${i + 1}`,
        species: speciesList[i % speciesList.length],
        breed: 'Giống lai',
        gender: i % 2 === 0 ? 'male' : 'female',
        age: (i % 5) + 1,
        weight: (i % 10) + 2,
        color: i % 2 === 0 ? 'Trắng' : 'Vàng'
      }));
    }

    // 5. Create Doctors (10 Doctors)
    console.log('Creating doctor profiles...');
    const doctors = [];
    for (let i = 0; i < 10; i++) {
      doctors.push(await Doctor.create({
        user: doctorUsers[i]._id,
        clinic: clinics[i % clinics.length]._id,
        specialization: i % 2 === 0 ? 'Phẫu thuật' : 'Khám tổng quát',
        experience: (i % 10) + 3,
        bio: 'Bác sĩ thú y tận tâm, yêu thương động vật.',
        rating: 4.5 + (i % 5)*0.1,
        totalReviews: 20 + i,
        availableSlots: [
          { day: 'monday', startTime: '08:00', endTime: '12:00' },
          { day: 'wednesday', startTime: '13:00', endTime: '17:00' },
          { day: 'friday', startTime: '08:00', endTime: '17:00' }
        ]
      }));
    }

    // 6. Create Services (15 Services, price <= 10,000)
    console.log('Creating services...');
    const services = [];
    const categories = ['checkup', 'vaccination', 'surgery', 'grooming', 'dental'];
    for (let i = 0; i < 15; i++) {
      services.push(await Service.create({
        name: `Dịch vụ ${categories[i % categories.length]} ${i + 1}`,
        description: 'Dịch vụ chăm sóc chất lượng cao.',
        price: 2000 + (i * 500), // Max price = 9500 VND
        duration: 30 + (i % 3) * 15,
        clinic: clinics[i % clinics.length]._id,
        category: categories[i % categories.length]
      }));
    }

    // 7. Create Appointments (15 Appointments)
    console.log('Creating appointments & payments...');
    const appointments = [];
    const payments = [];
    const medicalRecords = [];
    const reviews = [];

    for (let i = 0; i < 15; i++) {
      const customer = customers[i];
      const pet = pets[i];
      const service = services[i];
      const doctor = doctors[i % doctors.length];
      const clinic = doctor.clinic;
      
      const date = new Date();
      date.setDate(date.getDate() + (i % 5) - 2); // Some in past, some in future

      // Logic for status
      // We divide 15 appointments into different logical scenarios
      let paymentMethod = i % 2 === 0 ? 'payos' : 'cash';
      let status = 'pending';
      let paymentStatus = 'PENDING';
      
      if (paymentMethod === 'payos') {
        if (i % 4 === 0) {
          // Paid online -> confirmed
          status = 'confirmed';
          paymentStatus = 'PAID';
        } else if (i % 4 === 1) {
          // Paid online & completed visit
          status = 'completed';
          paymentStatus = 'PAID';
        } else {
          // Just booked online, hasn't paid yet
          status = 'pending';
          paymentStatus = 'PENDING';
        }
      } else {
        // cash
        if (i % 3 === 0) {
          // Visit completed, paid in cash at clinic
          status = 'completed';
          paymentStatus = 'PAID';
        } else {
          // Just booked, pending doctor confirmation
          status = 'pending';
          paymentStatus = 'PENDING';
        }
      }

      const appointment = await Appointment.create({
        customer: customer._id,
        pet: pet._id,
        clinic: clinic,
        doctor: doctor._id,
        services: [service._id],
        date: date,
        time: `09:0${i % 10}`,
        status: status,
        totalAmount: service.price,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod
      });
      appointments.push(appointment);

      // Create Payment Record
      const payment = await Payment.create({
        appointment: appointment._id,
        user: customer._id,
        orderCode: Number(String(Date.now()).slice(-6)) + i,
        amount: appointment.totalAmount,
        description: `Thanh toan #${i}`,
        status: paymentStatus,
        method: paymentMethod,
        paidAt: paymentStatus === 'PAID' ? new Date() : null
      });
      payments.push(payment);

      // If completed, create Medical Record and Review
      if (status === 'completed') {
        medicalRecords.push(await MedicalRecord.create({
          pet: appointment.pet,
          customer: appointment.customer,
          doctor: appointment.doctor,
          clinic: appointment.clinic,
          appointment: appointment._id,
          date: appointment.date,
          diagnosis: `Viêm da cấp độ ${i}`,
          treatment: `Vệ sinh và bôi thuốc`,
          prescription: `Thuốc mỡ kháng sinh`,
          notes: `Tái khám sau 1 tuần`,
          weight: 5 + (i % 5),
          temperature: 38.5 + (i % 10) * 0.1
        }));

        reviews.push(await Review.create({
          appointment: appointment._id,
          customer: appointment.customer,
          doctor: appointment.doctor,
          clinic: appointment.clinic,
          rating: 4 + (i % 2),
          comment: `Bác sĩ rất nhiệt tình và chu đáo!`
        }));
      }
    }

    // 8. Create Vaccinations (15 Vaccinations)
    console.log('Creating vaccinations...');
    const vaccinations = [];
    for (let i = 0; i < 15; i++) {
      const pet = pets[i];
      vaccinations.push(await Vaccination.create({
        user: pet.owner,
        pet: pet._id,
        vaccineName: `Vaccine ${i + 1}`,
        vaccineType: 'Phòng 7 bệnh',
        vaccinationDate: new Date(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + (i % 6) + 1)),
        notes: 'Tiêm đúng lịch, bé cưng khỏe mạnh.'
      }));
    }

    // 9. Create Notifications (15 Notifications)
    console.log('Creating notifications...');
    const notifications = [];
    for (let i = 0; i < 15; i++) {
      const customer = customers[i];
      notifications.push(await Notification.create({
        user: customer._id,
        title: `Chào mừng bạn ${customer.name}`,
        message: `Hệ thống VetCare đã sẵn sàng phục vụ thú cưng của bạn.`,
        type: 'booking',
        sourceNotification: new mongoose.Types.ObjectId(), // Bypass unique null index
        isRead: i % 2 === 0
      }));
    }

    console.log('--------------------------------------------------');
    console.log('✅ Seed new logical data successfully!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Clinics: ${clinics.length}`);
    console.log(`- Pets: ${pets.length}`);
    console.log(`- Doctors: ${doctors.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Appointments: ${appointments.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- MedicalRecords: ${medicalRecords.length}`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Vaccinations: ${vaccinations.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    console.log('--------------------------------------------------');
    
    // Export data to JSON files
    const exportDir = path.join(__dirname, '../compass-data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const collections = [
      { name: 'users', model: User },
      { name: 'clinics', model: Clinic },
      { name: 'pets', model: Pet },
      { name: 'doctors', model: Doctor },
      { name: 'services', model: Service },
      { name: 'appointments', model: Appointment },
      { name: 'payments', model: Payment },
      { name: 'medicalrecords', model: MedicalRecord },
      { name: 'reviews', model: Review },
      { name: 'vaccinations', model: Vaccination },
      { name: 'notifications', model: Notification }
    ];
    
    for (const col of collections) {
      const data = await col.model.find({});
      fs.writeFileSync(
        path.join(exportDir, `${col.name}.json`), 
        JSON.stringify(data, null, 2)
      );
    }
    
    console.log(`✅ New Logical Data exported to ${exportDir}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
