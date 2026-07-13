const express = require('express');
const router = express.Router();
const VaccinationController = require('../../controllers/customer/vaccination.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);
router.use(authorize('customer'));

// Get all vaccinations
router.get('/', VaccinationController.getAllVaccinations);

// Get a single vaccination
router.get('/:id', VaccinationController.getVaccinationById);

// Create a vaccination
router.post('/', VaccinationController.createVaccination);

// Update a vaccination
router.put('/:id', VaccinationController.updateVaccination);

// Delete a vaccination
router.delete('/:id', VaccinationController.deleteVaccination);

module.exports = router;
