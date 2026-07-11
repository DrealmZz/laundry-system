const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');

router.use(protect);
router.use(restrictTo('owner'));

router.get('/finance', reportController.getFinanceReport);
router.get('/summary', reportController.getSummary);
router.get('/daily', reportController.getDailyReport);
router.get('/profit-loss', reportController.getProfitLoss);
router.get('/shift-performance', reportController.getShiftPerformance);

router.get('/operational-costs', reportController.getOperationalCosts);
router.post('/operational-costs', reportController.createOperationalCost);
router.delete('/operational-costs/:id', reportController.deleteOperationalCost);

router.get('/sales-target', reportController.getSalesTarget);
router.put('/sales-target', reportController.setSalesTarget);

module.exports = router;
