const Pet = require('../../models/Pet');
const User = require('../../models/User');

class CustomerController {
  /**
   * Get all pets belonging to a specific customer
   * @route GET /api/doctor/customers/:id/pets
   */
  static async getCustomerPets(req, res, next) {
    try {
      const { id: customerId } = req.params;

      // Check if customer exists
      const customer = await User.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // Fetch pets
      const pets = await Pet.find({ owner: customerId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: pets
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
