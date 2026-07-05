const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');
const { ROLES } = require('../../../shared/constants');

router.use(protect);

// Existing routes
router.post('/', restrictTo(ROLES.KASIR), transaksiController.createTransaksi);

router.get('/', restrictTo(ROLES.KASIR, ROLES.ADMIN, ROLES.OWNER), transaksiController.getAllTransaksi);
router.get('/daily-recap', restrictTo(ROLES.KASIR), transaksiController.getDailyRecap);
router.get('/struk/:nomor_struk', restrictTo(ROLES.KASIR, ROLES.ADMIN), transaksiController.getTransaksiByStruk);
router.get('/:id', restrictTo(ROLES.KASIR, ROLES.ADMIN, ROLES.OWNER), transaksiController.getTransaksiById);
router.get('/:id/pdf', restrictTo(ROLES.KASIR, ROLES.ADMIN, ROLES.CUSTOMER), transaksiController.generatePDF);
router.get('/:id/qris', restrictTo(ROLES.KASIR, ROLES.ADMIN, ROLES.CUSTOMER), transaksiController.generateQR);

// New routes
router.patch('/:id/pay', restrictTo(ROLES.KASIR, ROLES.ADMIN), transaksiController.confirmPayment);

module.exports = router;
