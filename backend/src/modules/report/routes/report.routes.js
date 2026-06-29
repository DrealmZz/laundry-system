const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);
router.use(restrictTo('owner'));

router.get('/finance', reportController.getFinanceReport);
router.get('/summary', reportController.getSummary);
router.get('/daily', reportController.getDailyReport);

module.exports = router;
