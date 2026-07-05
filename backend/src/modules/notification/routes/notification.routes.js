const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');
const { ROLES } = require('../../../shared/constants');

router.use(protect);

router.get('/', restrictTo(ROLES.CUSTOMER), notificationController.getAllNotifications);
router.get('/count', restrictTo(ROLES.CUSTOMER), notificationController.getUnreadCount);
router.patch('/:id/read', restrictTo(ROLES.CUSTOMER), notificationController.markAsRead);

router.post('/', restrictTo(ROLES.ADMIN, ROLES.KASIR), notificationController.createNotification);

module.exports = router;
