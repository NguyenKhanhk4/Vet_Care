const Vaccination = require('../../models/Vaccination');
const Notification = require('../../models/Notification');
const Pet = require('../../models/Pet');

/**
 * Vaccination Service - Customer
 * Handles vaccination management for customers
 */
class VaccinationService {
  /**
   * Calculate status based on nextDueDate
   * @param {Date} nextDueDate
   * @returns {string} - 'Active' | 'Upcoming' | 'Overdue'
   */
  static calculateStatus(nextDueDate) {
    if (!nextDueDate) return 'Active';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays >= 0 && diffDays <= 7) {
      return 'Upcoming';
    } else {
      return 'Active';
    }
  }

  /**
   * Check and generate notifications for upcoming/overdue vaccinations
   * @param {Array} vaccinations
   * @param {string} userId
   */
  static async checkAndGenerateNotifications(vaccinations, userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find recently created reminder notifications to avoid spamming
      const recentNotifications = await Notification.find({
        user: userId,
        type: 'reminder',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      const notificationTitles = recentNotifications.map(n => n.title);

      for (const vac of vaccinations) {
        if (!vac.nextDueDate || !vac.pet) continue;
        
        const petName = vac.pet.name || 'Your pet';
        const vaccineName = vac.vaccineName;
        const status = this.calculateStatus(vac.nextDueDate);
        
        let title = '';
        let message = '';
        
        if (status === 'Upcoming') {
          const dueDate = new Date(vac.nextDueDate);
          dueDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          title = `Vaccination Reminder: ${petName}`;
          message = `🐶 ${petName} sẽ đến lịch tiêm vaccine ${vaccineName} sau ${diffDays} ngày.`;
        } else if (status === 'Overdue') {
          title = `Vaccination Overdue: ${petName}`;
          message = `⚠️ Vaccine ${vaccineName} của ${petName} đã quá hạn. Hãy đặt lịch khám.`;
        }

        // Create notification if we have a message and haven't notified about this recently
        if (message && !notificationTitles.includes(title)) {
          await Notification.create({
            user: userId,
            title,
            message,
            type: 'reminder',
            relatedId: vac._id
          });
          // Add to local list to prevent duplicates in the same run
          notificationTitles.push(title);
        }
      }
    } catch (error) {
      console.error('Error generating vaccination notifications:', error);
    }
  }

  /**
   * Get all vaccinations for a user
   * @param {string} userId
   * @returns {Array}
   */
  static async getAllVaccinations(userId) {
    const vaccinations = await Vaccination.find({ user: userId })
      .populate('pet', 'name species image')
      .sort({ nextDueDate: 1 });

    // Format with status
    const formattedVaccinations = vaccinations.map(v => {
      const doc = v.toObject();
      doc.status = this.calculateStatus(v.nextDueDate);
      return doc;
    });

    // Run notification check in background
    this.checkAndGenerateNotifications(vaccinations, userId).catch(console.error);

    return formattedVaccinations;
  }

  /**
   * Get vaccination by ID
   * @param {string} id
   * @param {string} userId
   * @returns {Object}
   */
  static async getVaccinationById(id, userId) {
    const vaccination = await Vaccination.findOne({ _id: id, user: userId })
      .populate('pet', 'name species image');
      
    if (!vaccination) {
      throw new Error('Vaccination not found');
    }

    const doc = vaccination.toObject();
    doc.status = this.calculateStatus(vaccination.nextDueDate);
    return doc;
  }

  /**
   * Create new vaccination
   * @param {string} userId
   * @param {Object} data
   * @returns {Object}
   */
  static async createVaccination(userId, data) {
    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: data.pet, owner: userId });
    if (!pet) {
      throw new Error('Pet not found or does not belong to you');
    }

    if (new Date(data.nextDueDate) <= new Date(data.vaccinationDate)) {
      throw new Error('Next due date must be after vaccination date');
    }

    const vaccination = await Vaccination.create({
      ...data,
      user: userId
    });

    return vaccination;
  }

  /**
   * Update vaccination
   * @param {string} id
   * @param {string} userId
   * @param {Object} data
   * @returns {Object}
   */
  static async updateVaccination(id, userId, data) {
    if (data.pet) {
      const pet = await Pet.findOne({ _id: data.pet, owner: userId });
      if (!pet) {
        throw new Error('Pet not found or does not belong to you');
      }
    }

    if (data.nextDueDate && data.vaccinationDate && new Date(data.nextDueDate) <= new Date(data.vaccinationDate)) {
      throw new Error('Next due date must be after vaccination date');
    }

    const vaccination = await Vaccination.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { new: true, runValidators: true }
    );

    if (!vaccination) {
      throw new Error('Vaccination not found');
    }

    return vaccination;
  }

  /**
   * Delete vaccination
   * @param {string} id
   * @param {string} userId
   * @returns {Object}
   */
  static async deleteVaccination(id, userId) {
    const vaccination = await Vaccination.findOneAndDelete({ _id: id, user: userId });
    if (!vaccination) {
      throw new Error('Vaccination not found');
    }
    return vaccination;
  }
}

module.exports = VaccinationService;
