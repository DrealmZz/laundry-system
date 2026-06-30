const express = require('express');
const router = express.Router();
const pemesananController = require('../controllers/pemesanan.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);

router.post('/', restrictTo('customer'), pemesananController.createPemesanan);

router.get('/', pemesananController.getAllPemesanan);
router.get('/:id', pemesananController.getPemesananById);

router.patch('/:id/status', restrictTo('admin', 'kasir'), pemesananController.updateStatus);
router.patch('/:id/cancel', restrictTo('admin', 'kasir'), pemesananController.cancelPemesanan);

module.exports = router;
