const PetService = require('../../services/customer/pet.service');

/**
 * Pet Controller - Customer
 * Handles HTTP requests for pet CRUD operations
 */
class PetController {
  /**
   * GET /api/customer/pets
   */
  static async getAllPets(req, res, next) {
    try {
      const pets = await PetService.getAllPets(req.user._id);

      res.status(200).json({
        success: true,
        count: pets.length,
        data: pets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/customer/pets/:id
   */
  static async getPetById(req, res, next) {
    try {
      const pet = await PetService.getPetById(req.params.id, req.user._id);

      res.status(200).json({
        success: true,
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/customer/pets
   */
  static async createPet(req, res, next) {
    try {
      const petData = { ...req.body };
      if (req.file) {
        petData.image = `/uploads/${req.file.filename}`;
      }

      const pet = await PetService.createPet(req.user._id, petData);

      res.status(201).json({
        success: true,
        message: 'Pet added successfully',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/customer/pets/:id
   */
  static async updatePet(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const pet = await PetService.updatePet(req.params.id, req.user._id, updateData);

      res.status(200).json({
        success: true,
        message: 'Pet updated successfully',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/customer/pets/:id
   */
  static async deletePet(req, res, next) {
    try {
      await PetService.deletePet(req.params.id, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Pet deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PetController;
