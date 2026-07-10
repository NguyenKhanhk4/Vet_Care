require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Pet = require('./models/Pet');
const Vaccination = require('./models/Vaccination');
const User = require('./models/User');

const seedVaccinations = async () => {
  try {
    await connectDB();
    
    console.log('Clearing old vaccination data...');
    await Vaccination.deleteMany({});
    
    console.log('Fetching customers and their pets...');
    const pets = await Pet.find().populate('owner');
    
    if (pets.length === 0) {
      console.log('No pets found in the database. Please add a pet first.');
      process.exit(0);
    }
    
    const vaccinationsData = [];
    
    // Add 3 vaccinations for each pet (1 Active, 1 Upcoming, 1 Overdue)
    for (const pet of pets) {
      const today = new Date();
      
      // 1. Active: Vaccinated 6 months ago, due in 6 months
      const activeVac = new Vaccination({
        user: pet.owner._id,
        pet: pet._id,
        vaccineName: 'Rabies (Dại)',
        vaccineType: 'Core',
        vaccinationDate: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        nextDueDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        notes: 'Tiêm phòng dại định kỳ hàng năm. Bé hợp thuốc, không sốt.',
      });
      vaccinationsData.push(activeVac);
      
      // 2. Upcoming: Vaccinated 11 months ago, due in 5 days
      const upcomingVac = new Vaccination({
        user: pet.owner._id,
        pet: pet._id,
        vaccineName: 'DHPP (5 bệnh)',
        vaccineType: 'Core',
        vaccinationDate: new Date(today.getTime() - 360 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'Mũi tiêm tổng hợp 5 bệnh. Sắp đến hạn tiêm nhắc lại.',
      });
      vaccinationsData.push(upcomingVac);
      
      // 3. Overdue: Vaccinated 2 years ago, due 1 year ago
      const overdueVac = new Vaccination({
        user: pet.owner._id,
        pet: pet._id,
        vaccineName: 'Bordetella (Ho cũi chó)',
        vaccineType: 'Non-core',
        vaccinationDate: new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        notes: 'Đã quá hạn tiêm phòng! Cần đưa bé đi tiêm gấp.',
      });
      vaccinationsData.push(overdueVac);
    }
    
    await Vaccination.insertMany(vaccinationsData);
    
    console.log(`✅ Successfully seeded ${vaccinationsData.length} vaccination records.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedVaccinations();
