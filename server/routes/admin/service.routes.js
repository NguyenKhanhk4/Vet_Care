const express = require('express');
const router = express.Router();
const AdminServiceController = require('../../controllers/admin/service.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

/**
 * Admin Service Management Routes
 */
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminServiceController.getAllServices);
router.get('/:id', AdminServiceController.getServiceById);
router.post('/', AdminServiceController.createService);
router.put('/:id', AdminServiceController.updateService);
router.delete('/:id', AdminServiceController.deleteService);

module.exports = router;
