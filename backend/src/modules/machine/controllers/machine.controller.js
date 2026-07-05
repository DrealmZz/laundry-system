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

exports.createMachine = async (req, res, next) => {
  try {
    const { kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter } = req.body;

    if (!kode_mesin || !tipe_mesin || !nama_mesin) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'kode_mesin, tipe_mesin, dan nama_mesin wajib diisi.'
      });
    }

    const machine = await machineService.createMachine({
      kode_mesin,
      tipe_mesin,
      nama_mesin,
      kapasitas_kg,
      konsumsi_kwh,
      penggunaan_air_liter
    });

    res.status(201).json({
      status: 'success',
      data: machine,
      message: 'Mesin berhasil ditambahkan'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMachine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter } = req.body;

    const machine = await machineService.updateMachine(parseInt(id), {
      nama_mesin,
      kapasitas_kg,
      konsumsi_kwh,
      penggunaan_air_liter
    });

    res.status(200).json({
      status: 'success',
      data: machine,
      message: 'Mesin berhasil diupdate'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMachineStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_mesin } = req.body;

    if (!status_mesin) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'status_mesin wajib diisi.'
      });
    }

    const machine = await machineService.updateMachineStatus(parseInt(id), status_mesin);

    res.status(200).json({
      status: 'success',
      data: machine,
      message: 'Status mesin berhasil diubah'
    });
  } catch (err) {
    next(err);
  }
};
