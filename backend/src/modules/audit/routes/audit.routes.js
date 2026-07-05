const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');
const { ROLES } = require('../../../shared/constants');

router.use(protect);

router.get('/', restrictTo(ROLES.ADMIN), auditController.getAllAuditLogs);
router.get('/:id', restrictTo(ROLES.ADMIN), auditController.getAuditLogById);

module.exports = router;
