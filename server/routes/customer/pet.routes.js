const express = require('express');
const { body } = require('express-validator');
const PetController = require('../../controllers/customer/pet.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { uploadSingle } = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

/**
 * Customer Pet Routes
 * Base path: /api/customer/pets
 * All routes require authentication
 */

router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/pets
router.get('/', PetController.getAllPets);

// GET /api/customer/pets/:id
router.get('/:id', PetController.getPetById);

// POST /api/customer/pets
router.post(
  '/',
  uploadSingle,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Pet name is required')
      .isLength({ max: 50 }).withMessage('Pet name cannot exceed 50 characters'),
    body('species')
      .trim()
      .notEmpty().withMessage('Species is required')
      .isIn(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'])
      .withMessage('Invalid species'),
    body('breed').optional().trim(),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'unknown']).withMessage('Invalid gender'),
    body('age')
      .optional()
      .isFloat({ min: 0, max: 50 }).withMessage('Age must be between 0 and 50'),
    body('weight')
      .optional()
      .isFloat({ min: 0, max: 200 }).withMessage('Weight must be between 0 and 200 kg'),
    body('color').optional().trim(),
    body('vaccineStatus')
      .optional()
      .isIn(['up-to-date', 'overdue', 'not-vaccinated', 'unknown'])
      .withMessage('Invalid vaccine status'),
  ],
  validate,
  PetController.createPet
);

// PUT /api/customer/pets/:id
router.put(
  '/:id',
  uploadSingle,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Pet name cannot exceed 50 characters'),
    body('species')
      .optional()
      .trim()
      .isIn(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'])
      .withMessage('Invalid species'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'unknown']).withMessage('Invalid gender'),
    body('age')
      .optional()
      .isFloat({ min: 0, max: 50 }).withMessage('Age must be between 0 and 50'),
    body('weight')
      .optional()
      .isFloat({ min: 0, max: 200 }).withMessage('Weight must be between 0 and 200 kg'),
    body('vaccineStatus')
      .optional()
      .isIn(['up-to-date', 'overdue', 'not-vaccinated', 'unknown'])
      .withMessage('Invalid vaccine status'),
  ],
  validate,
  PetController.updatePet
);

// DELETE /api/customer/pets/:id
router.delete('/:id', PetController.deletePet);

module.exports = router;
