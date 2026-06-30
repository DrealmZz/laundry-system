const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);

router.post('/', restrictTo('kasir'), transaksiController.createTransaksi);

router.get('/', restrictTo('kasir', 'admin', 'owner'), transaksiController.getAllTransaksi);
router.get('/struk/:nomor_struk', restrictTo('kasir', 'admin'), transaksiController.getTransaksiByStruk);
router.get('/:id', restrictTo('kasir', 'admin', 'owner'), transaksiController.getTransaksiById);

module.exports = router;
