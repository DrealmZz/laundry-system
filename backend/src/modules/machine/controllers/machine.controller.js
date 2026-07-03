const machineService = require('../services/machine.service');

exports.getAll = async (req, res, next) => {
  try {
    const data = await machineService.getAll();
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await machineService.getById(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

exports.getAvailable = async (req, res, next) => {
  try {
    const { tanggal, shift } = req.query;
    const data = await machineService.getAvailableByDateAndShift(tanggal, shift);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};
