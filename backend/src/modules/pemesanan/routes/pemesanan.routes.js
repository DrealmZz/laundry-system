const express = require('express');
const router = express.Router();
const pemesananController = require('../controllers/pemesanan.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);

router.post('/', restrictTo('customer'), pemesananController.createPemesanan);

router.get('/', pemesananController.getAllPemesanan);
router.get('/:id', pemesananController.getPemesananById);

router.patch('/:id/status', restrictTo('admin', 'kasir'), pemesananController.updateStatus);
router.patch('/:id/approve', restrictTo('admin'), pemesananController.approveBooking);
router.patch('/:id/reject', restrictTo('admin'), pemesananController.rejectBooking);
router.patch('/:id/cancel', pemesananController.cancelPemesanan);
router.patch('/:id/confirm-pickup', restrictTo('kasir'), pemesananController.confirmPickup);
router.patch('/:id/confirm-clothes', restrictTo('kasir'), pemesananController.confirmClothesReceived);
router.patch('/:id/weigh', restrictTo('kasir'), pemesananController.weighAndNotify);
router.get('/:id/qris', restrictTo('customer'), pemesananController.generateQR);
router.patch('/:id/confirm-payment', restrictTo('customer'), pemesananController.confirmPayment);
router.patch('/:id/set-delivery', restrictTo('customer'), pemesananController.setDeliverySchedule);
router.patch('/:id/confirm-received', restrictTo('customer'), pemesananController.confirmReceived);
router.patch('/:id/metode-pengambilan', restrictTo('admin', 'kasir'), pemesananController.updateMetodePengambilan);

module.exports = router;
