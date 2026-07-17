const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Clinic = require('./models/Clinic');
const Pet = require('./models/Pet');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Review = require('./models/Review');
const Vaccination = require('./models/Vaccination');

// Data arrays
const clinicNames = ['Phòng Khám Thú Y PetCare', 'Bệnh Viện Thú Y Tropicpet', 'Phòng Khám Thú Y 24/7', 'Thú Y Chợ Lớn', 'Hệ Thống Thú Y DogAndCat'];
const clinicAddresses = ['123 Nguyễn Trãi, Thanh Xuân, Hà Nội', '45 Lê Văn Lương, Cầu Giấy, Hà Nội', '67 Nguyễn Đình Chiểu, Quận 3, TP.HCM', '89 Võ Văn Ngân, Thủ Đức, TP.HCM', '101 Cách Mạng Tháng 8, Quận 10, TP.HCM'];

const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const lastNames = ['An', 'Bình', 'Châu', 'Dũng', 'Em', 'Phong', 'Giang', 'Hải', 'Linh', 'Khoa', 'Lan', 'Minh', 'Ngọc', 'Oanh', 'Phú', 'Quốc', 'Tuấn', 'Sơn', 'Tâm', 'Uyên', 'Vy', 'Xuân', 'Yến'];

const petNames = ['Milo', 'Miu', 'Lu', 'Bé Bự', 'Bông', 'Cacao', 'Gấu', 'Kem', 'Xúc Xích', 'Sữa', 'Nâu', 'Vàng', 'Đen', 'Cún', 'Mực', 'Mimi', 'Nhọ', 'Sóc', 'Bò', 'Tiger', 'Leo', 'Simba', 'Luna', 'Bella'];
const speciesList = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'];

const serviceNames = ['Khám tổng quát', 'Khám chuyên khoa', 'Tiêm phòng vaccine 5 bệnh', 'Tiêm phòng vaccine dại', 'Triệt sản mèo đực', 'Triệt sản mèo cái', 'Triệt sản chó đực', 'Triệt sản chó cái', 'Siêu âm thai', 'Chụp X-Quang', 'Xét nghiệm máu tổng quát', 'Cạo vôi răng', 'Tắm gội cắt tỉa lông', 'Lưu chuồng theo dõi', 'Điều trị nội trú', 'Phẫu thuật ngoại khoa', 'Cấp cứu 24/7'];

// helper to get random element
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generatePhone = () => '0' + Math.floor(Math.random() * 900000000 + 100000000);

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany();
        await Doctor.deleteMany();
        await Clinic.deleteMany();
        await Pet.deleteMany();
        await Service.deleteMany();
        await Appointment.deleteMany();
        await MedicalRecord.deleteMany();
        await Review.deleteMany();
        await Vaccination.deleteMany();
        console.log('🗑️  Cleared existing data');

        // 1. Clinics (5)
        const clinicsData = clinicNames.map((name, i) => ({
            name,
            address: clinicAddresses[i],
            phone: generatePhone(),
            email: `contact${i}@vetcare.com`,
            description: `Phòng khám thú y hiện đại, tận tâm với đội ngũ bác sĩ chuyên nghiệp tại ${name}`,
            openingHours: '08:00 - 18:00',
            isActive: true
        }));
        const clinics = await Clinic.insertMany(clinicsData);
        console.log(`🏥 Created ${clinics.length} clinics`);

        // 2. Admin (1)
        const admin = new User({
            name: 'Quản Trị Viên',
            email: 'admin@vetcare.com',
            password: 'Vetcare123',
            phone: '0999999999',
            role: 'admin'
        });
        await admin.save();
        console.log('👑 Created Admin user');

        // 3. Customers (20)
        const customerPromises = [];
        for (let i = 1; i <= 20; i++) {
            const customer = new User({
                name: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
                email: `customer${i}@gmail.com`,
                password: 'Vetcare123',
                phone: generatePhone(),
                address: `${Math.floor(Math.random()*100) + 1} Đường số ${Math.floor(Math.random()*20) + 1}, Quận ${Math.floor(Math.random()*12) + 1}, TP.HCM`,
                role: 'customer'
            });
            customerPromises.push(customer.save());
        }
        const customers = await Promise.all(customerPromises);
        console.log(`👤 Created ${customers.length} customers`);

        // 4. Doctors (15)
        const doctorUsersPromises = [];
        for (let i = 1; i <= 15; i++) {
            const docUser = new User({
                name: `BS. ${getRandom(firstNames)} ${getRandom(lastNames)}`,
                email: `doctor${i}@vetcare.com`,
                password: 'Vetcare123',
                phone: generatePhone(),
                role: 'doctor'
            });
            doctorUsersPromises.push(docUser.save());
        }
        const doctorUsers = await Promise.all(doctorUsersPromises);
        
        const doctorsData = doctorUsers.map((user, index) => {
            // Distribute doctors evenly across clinics
            const clinic = clinics[index % clinics.length];
            return {
                user: user._id,
                clinic: clinic._id,
                specialization: getRandom(['Nội khoa', 'Ngoại khoa', 'Da liễu', 'Chẩn đoán hình ảnh', 'Dinh dưỡng']),
                experience: Math.floor(Math.random() * 10) + 2,
                bio: `Bác sĩ chuyên khoa giàu kinh nghiệm trong lĩnh vực chăm sóc và điều trị thú cưng. Luôn tận tâm với nghề.`,
                rating: Math.floor(Math.random() * 2) + 3,
                totalReviews: Math.floor(Math.random() * 20),
                isActive: true
            };
        });
        const doctors = await Doctor.insertMany(doctorsData);
        console.log(`🩺 Created ${doctors.length} doctors`);

        // 5. Pets (2-3 per customer)
        const petsData = [];
        customers.forEach(customer => {
            const numPets = Math.floor(Math.random() * 2) + 2; // 2 to 3
            for (let i = 0; i < numPets; i++) {
                petsData.push({
                    owner: customer._id,
                    name: getRandom(petNames),
                    species: getRandom(speciesList),
                    breed: 'Giống lai',
                    gender: getRandom(['male', 'female', 'unknown']),
                    age: Math.floor(Math.random() * 10) + 1,
                    weight: Math.floor(Math.random() * 20) + 1,
                    color: getRandom(['Vàng', 'Đen', 'Trắng', 'Khoang', 'Tam thể']),
                    vaccineStatus: getRandom(['up-to-date', 'overdue', 'not-vaccinated', 'unknown'])
                });
            }
        });
        const pets = await Pet.insertMany(petsData);
        console.log(`🐾 Created ${pets.length} pets`);

        // 6. Services (15+)
        const servicesData = [];
        clinics.forEach(clinic => {
            // Each clinic gets 4 random services to meet the requirement while associating with clinics
            for(let i=0; i<4; i++) {
                const name = getRandom(serviceNames);
                servicesData.push({
                    name,
                    description: `Dịch vụ ${name} chất lượng cao, an toàn cho thú cưng của bạn tại ${clinic.name}.`,
                    price: Math.floor(Math.random() * 10) * 50000 + 100000, // 100k - 600k
                    duration: Math.floor(Math.random() * 3) * 30 + 30, // 30, 60, 90, 120 mins
                    clinic: clinic._id,
                    isActive: true
                });
            }
        });
        const services = await Service.insertMany(servicesData);
        console.log(`📋 Created ${services.length} services`);

        // 7. Appointments (30)
        const appointmentsData = [];
        const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        for (let i = 0; i < 30; i++) {
            const pet = getRandom(pets);
            const customer = customers.find(c => c._id.toString() === pet.owner.toString());
            const doctor = getRandom(doctors);
            const clinicServices = services.filter(s => s.clinic.toString() === doctor.clinic.toString());
            
            // If the clinic has no services, skip or use a random service (but standard logic says clinic must match)
            if (clinicServices.length === 0) continue;
            const service = getRandom(clinicServices);
            
            // Generate a random date within the next/past 30 days
            const date = new Date();
            date.setDate(date.getDate() + (Math.floor(Math.random() * 60) - 30));
            
            appointmentsData.push({
                customer: customer._id,
                pet: pet._id,
                clinic: doctor.clinic,
                doctor: doctor._id,
                service: service._id,
                date: date,
                time: `${Math.floor(Math.random() * 8) + 8}:00`, // 8:00 to 16:00
                status: getRandom(statuses),
                reason: `Cần tư vấn và sử dụng dịch vụ ${service.name} cho bé ${pet.name}.`,
                notes: 'Vui lòng sắp xếp bác sĩ nhẹ nhàng vì bé khá nhát.'
            });
        }
        const appointments = await Appointment.insertMany(appointmentsData);
        console.log(`📅 Created ${appointments.length} appointments`);

        // 8. Medical Records & Reviews (for completed appointments)
        const completedAppointments = appointments.filter(a => a.status === 'completed');
        const medicalRecordsData = [];
        const reviewsData = [];

        for (const appt of completedAppointments) {
            medicalRecordsData.push({
                appointment: appt._id,
                customer: appt.customer,
                pet: appt.pet,
                doctor: appt.doctor,
                clinic: appt.clinic,
                date: appt.date,
                diagnosis: `Thú cưng có biểu hiện bình thường sau khi kiểm tra. Không phát hiện bất thường nghiêm trọng.`,
                treatment: `Vệ sinh sạch sẽ, theo dõi thêm tại nhà.`,
                prescription: 'Vitamin C tổng hợp: 1 viên/ngày x 7 ngày.\nMen tiêu hóa: 1 gói/ngày.',
                notes: 'Tái khám sau 1 tháng nếu có biểu hiện bất thường.',
                weight: Math.floor(Math.random() * 20) + 1,
                temperature: (Math.random() * 2 + 37).toFixed(1), // 37.0 - 39.0
            });
            
            reviewsData.push({
                customer: appt.customer,
                doctor: appt.doctor,
                clinic: appt.clinic,
                appointment: appt._id,
                rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
                comment: 'Bác sĩ rất nhiệt tình, phòng khám sạch sẽ. Mình rất an tâm khi mang thú cưng đến đây.',
                isPublished: true
            });
        }
        
        if (medicalRecordsData.length > 0) await MedicalRecord.insertMany(medicalRecordsData);
        if (reviewsData.length > 0) await Review.insertMany(reviewsData);
        console.log(`📝 Created ${medicalRecordsData.length} medical records & reviews`);

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
