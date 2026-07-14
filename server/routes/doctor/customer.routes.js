const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/doctor/customer.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// All routes require doctor authentication
router.use(authenticate);
router.use(authorize('doctor'));

// Get all pets of a customer
router.get('/:id/pets', customerController.getCustomerPets);

module.exports = router;
