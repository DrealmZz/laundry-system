const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

router.post('/', restrictTo('admin'), serviceController.createService);
router.put('/:id', restrictTo('admin'), serviceController.updateService);
router.delete('/:id', restrictTo('admin'), serviceController.deleteService);

module.exports = router;
