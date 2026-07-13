const Pet = require('../../models/Pet');

class AdminPetService {
  /**
   * Returns pets across the whole system, including their owner for admin use.
   * @param {Object} query - { page, limit, search, species }
   */
  static async getAllPets(query = {}) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (query.species) filter.species = query.species;
    if (query.search?.trim()) {
      const search = query.search.trim();
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
      ];
    }

    const [pets, total] = await Promise.all([
      Pet.find(filter)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Pet.countDocuments(filter),
    ]);

    return {
      pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = AdminPetService;
