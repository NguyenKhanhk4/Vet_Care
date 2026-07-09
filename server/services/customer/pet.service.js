const Pet = require('../../models/Pet');

/**
 * Pet Service - Customer
 * Handles CRUD operations for customer's pets
 * All operations are scoped to the authenticated user
 */
class PetService {
  /**
   * Get all pets belonging to a customer
   * @param {string} ownerId - Owner's MongoDB ObjectId
   * @returns {Array} - List of pets
   */
  static async getAllPets(ownerId) {
    return await Pet.find({ owner: ownerId }).sort({ createdAt: -1 });
  }

  /**
   * Get a specific pet by ID (must belong to the customer)
   * @param {string} petId - Pet's MongoDB ObjectId
   * @param {string} ownerId - Owner's MongoDB ObjectId
   * @returns {Object} - Pet data
   */
  static async getPetById(petId, ownerId) {
    const pet = await Pet.findOne({ _id: petId, owner: ownerId });

    if (!pet) {
      const error = new Error('Pet not found');
      error.statusCode = 404;
      throw error;
    }

    return pet;
  }

  /**
   * Create a new pet
   * @param {string} ownerId - Owner's MongoDB ObjectId
   * @param {Object} petData - Pet information
   * @returns {Object} - Created pet
   */
  static async createPet(ownerId, petData) {
    const pet = await Pet.create({
      ...petData,
      owner: ownerId,
    });

    return pet;
  }

  /**
   * Update a pet (must belong to the customer)
   * @param {string} petId - Pet's MongoDB ObjectId
   * @param {string} ownerId - Owner's MongoDB ObjectId
   * @param {Object} updateData - Updated pet information
   * @returns {Object} - Updated pet
   */
  static async updatePet(petId, ownerId, updateData) {
    // Remove owner field from update data to prevent ownership changes
    delete updateData.owner;

    const pet = await Pet.findOneAndUpdate(
      { _id: petId, owner: ownerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!pet) {
      const error = new Error('Pet not found');
      error.statusCode = 404;
      throw error;
    }

    return pet;
  }

  /**
   * Delete a pet (must belong to the customer)
   * @param {string} petId - Pet's MongoDB ObjectId
   * @param {string} ownerId - Owner's MongoDB ObjectId
   * @returns {Object} - Deleted pet
   */
  static async deletePet(petId, ownerId) {
    const pet = await Pet.findOneAndDelete({ _id: petId, owner: ownerId });

    if (!pet) {
      const error = new Error('Pet not found');
      error.statusCode = 404;
      throw error;
    }

    return pet;
  }
}

module.exports = PetService;
