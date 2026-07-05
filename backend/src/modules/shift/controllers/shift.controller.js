const shiftService = require('../services/shift.service');

exports.getAllShifts = async (req, res, next) => {
  try {
    const { tanggal, nama_shift, page, limit } = req.query;
    const result = await shiftService.getAllShifts({ tanggal, nama_shift, page, limit });

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Daftar shift berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};

exports.getShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await shiftService.getShiftById(parseInt(id));

    res.status(200).json({
      status: 'success',
      data: shift,
      message: 'Detail shift berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};

exports.createShift = async (req, res, next) => {
  try {
    const { nama_shift, tanggal, jam_mulai, jam_selesai } = req.body;

    if (!nama_shift || !tanggal || !jam_mulai || !jam_selesai) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'nama_shift, tanggal, jam_mulai, dan jam_selesai wajib diisi.'
      });
    }

    const shift = await shiftService.createShift({ nama_shift, tanggal, jam_mulai, jam_selesai });

    res.status(201).json({
      status: 'success',
      data: shift,
      message: 'Shift berhasil dibuat'
    });
  } catch (err) {
    next(err);
  }
};

exports.updateShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jam_mulai, jam_selesai } = req.body;

    if (!jam_mulai || !jam_selesai) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'jam_mulai dan jam_selesai wajib diisi.'
      });
    }

    const shift = await shiftService.updateShift(parseInt(id), { jam_mulai, jam_selesai });

    res.status(200).json({
      status: 'success',
      data: shift,
      message: 'Shift berhasil diupdate'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    await shiftService.deleteShift(parseInt(id));

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Shift berhasil dihapus'
    });
  } catch (err) {
    next(err);
  }
};

exports.getKaryawanByShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await shiftService.getKaryawanByShift(parseInt(id));

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Daftar karyawan shift berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};

exports.assignKaryawan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_karyawan } = req.body;

    if (!id_karyawan) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'id_karyawan wajib diisi.'
      });
    }

    await shiftService.assignKaryawanToShift({ id_shift: parseInt(id), id_karyawan: parseInt(id_karyawan) });

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Karyawan berhasil di-assign ke shift'
    });
  } catch (err) {
    next(err);
  }
};

exports.unassignKaryawan = async (req, res, next) => {
  try {
    const { id, karyawan_id } = req.params;
    await shiftService.unassignKaryawanFromShift({ id_shift: parseInt(id), id_karyawan: parseInt(karyawan_id) });

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Karyawan berhasil di-unassign dari shift'
    });
  } catch (err) {
    next(err);
  }
};
