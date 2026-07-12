const express = require('express');
const router = express.Router();
const AdminPetController = require('../../controllers/admin/pet.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminPetController.getAllPets);

module.exports = router;
