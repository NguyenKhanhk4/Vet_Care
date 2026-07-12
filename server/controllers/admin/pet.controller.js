const AdminPetService = require('../../services/admin/pet.service');

class AdminPetController {
  static async getAllPets(req, res, next) {
    try {
      const result = await AdminPetService.getAllPets(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminPetController;
