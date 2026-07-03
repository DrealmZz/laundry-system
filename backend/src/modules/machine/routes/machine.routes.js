const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machine.controller');
const { protect } = require('../../../shared/middlewares/auth.middleware');

router.get('/', protect, machineController.getAll);
router.get('/available', protect, machineController.getAvailable);
router.get('/:id', protect, machineController.getById);

module.exports = router;
