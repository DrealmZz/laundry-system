const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');
const { protect, restrictTo } = require('../../../shared/middlewares/auth.middleware');
const { ROLES } = require('../../../shared/constants');

router.use(protect);

router.get('/', restrictTo(ROLES.ADMIN, ROLES.OWNER), shiftController.getAllShifts);
router.get('/:id', restrictTo(ROLES.ADMIN, ROLES.OWNER), shiftController.getShiftById);
router.get('/:id/karyawan', restrictTo(ROLES.ADMIN, ROLES.OWNER), shiftController.getKaryawanByShift);

router.post('/', restrictTo(ROLES.ADMIN), shiftController.createShift);
router.put('/:id', restrictTo(ROLES.ADMIN), shiftController.updateShift);
router.delete('/:id', restrictTo(ROLES.ADMIN), shiftController.deleteShift);
router.post('/:id/assign', restrictTo(ROLES.ADMIN), shiftController.assignKaryawan);
router.delete('/:id/unassign/:karyawan_id', restrictTo(ROLES.ADMIN), shiftController.unassignKaryawan);

module.exports = router;
