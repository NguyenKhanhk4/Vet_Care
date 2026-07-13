const VaccinationService = require('../../services/customer/vaccination.service');

/**
 * Vaccination Controller - Customer
 */
class VaccinationController {
  /**
   * Get all vaccinations
   */
  static async getAllVaccinations(req, res) {
    try {
      const vaccinations = await VaccinationService.getAllVaccinations(req.user._id);
      res.json({ success: true, data: vaccinations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get vaccination by ID
   */
  static async getVaccinationById(req, res) {
    try {
      const vaccination = await VaccinationService.getVaccinationById(req.params.id, req.user._id);
      res.json({ success: true, data: vaccination });
    } catch (error) {
      if (error.message === 'Vaccination not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create vaccination
   */
  static async createVaccination(req, res) {
    try {
      const vaccination = await VaccinationService.createVaccination(req.user._id, req.body);
      res.status(201).json({ success: true, data: vaccination });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Update vaccination
   */
  static async updateVaccination(req, res) {
    try {
      const vaccination = await VaccinationService.updateVaccination(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: vaccination });
    } catch (error) {
      if (error.message === 'Vaccination not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete vaccination
   */
  static async deleteVaccination(req, res) {
    try {
      await VaccinationService.deleteVaccination(req.params.id, req.user._id);
      res.json({ success: true, message: 'Vaccination deleted successfully' });
    } catch (error) {
      if (error.message === 'Vaccination not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = VaccinationController;
