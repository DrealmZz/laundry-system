const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machine.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');
const { ROLES } = require('../../../shared/constants');

// Public routes (butuh login)
router.get('/', protect, machineController.getAll);
router.get('/status', protect, machineController.getAllWithStatus);
router.get('/available', protect, machineController.getAvailable);
router.get('/:id', protect, machineController.getById);

// Admin only routes
router.post('/', protect, restrictTo(ROLES.ADMIN), machineController.createMachine);
router.put('/:id', protect, restrictTo(ROLES.ADMIN), machineController.updateMachine);
router.delete('/:id', protect, restrictTo(ROLES.ADMIN), machineController.deleteMachine);
router.patch('/:id/status', protect, restrictTo(ROLES.ADMIN), machineController.updateMachineStatus);

module.exports = router;
