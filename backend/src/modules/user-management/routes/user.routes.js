const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);

router.get('/customers', restrictTo('admin', 'kasir'), userController.getCustomers);
router.get('/karyawan', restrictTo('admin'), userController.getKaryawan);
router.get('/owners', restrictTo('admin'), userController.getOwners);

router.get('/:table/:id', restrictTo('admin'), userController.getUserById);

router.post('/customers', restrictTo('admin', 'kasir'), userController.createCustomer);
router.post('/karyawan', restrictTo('admin'), userController.createKaryawan);

router.put('/:table/:id', restrictTo('admin'), userController.updateUser);

router.patch('/:table/:id/reset-password', restrictTo('admin'), userController.resetPassword);
router.patch('/:table/:id/status', restrictTo('admin'), userController.setStatus);

module.exports = router;
