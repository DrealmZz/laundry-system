const pemesananService = require('../services/pemesanan.service');

exports.createPemesanan = async (req, res, next) => {
  try {
    const { id_layanan, id_mesin, tanggal_pesanan, shift, berat_kg, jenis_pencucian, metode_pengambilan, catatan } = req.body;

    if (!id_layanan || !tanggal_pesanan || !shift || !jenis_pencucian || !metode_pengambilan) {
      return res.status(400).json({
        status: 'error',
        message: 'id_layanan, tanggal_pesanan, shift, jenis_pencucian, dan metode_pengambilan wajib diisi.',
      });
    }

    const pemesanan = await pemesananService.createPemesanan({
      id_customer: req.user.id,
      id_layanan,
      id_mesin,
      tanggal_pesanan,
      shift,
      berat_kg,
      jenis_pencucian,
      metode_pengambilan,
      catatan,
    });

    res.status(201).json({
      status: 'success',
      message: 'Pemesanan berhasil dibuat.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPemesanan = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status_pesanan = req.query.status || null;

    let id_customer = null;
    if (req.user.role === 'customer') {
      id_customer = req.user.id;
    } else if (req.query.id_customer) {
      id_customer = parseInt(req.query.id_customer);
    }

    const result = await pemesananService.getAllPemesanan({ id_customer, status_pesanan, limit, offset });

    res.status(200).json({
      status: 'success',
      data: result.pemesanan,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPemesananById = async (req, res, next) => {
  try {
    const pemesanan = await pemesananService.getPemesananById(parseInt(req.params.id));

    if (req.user.role === 'customer' && pemesanan.id_customer !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses untuk melihat pemesanan ini.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status wajib diisi.',
      });
    }

    const pemesanan = await pemesananService.updateStatus(
      parseInt(req.params.id),
      status,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: `Status pemesanan berhasil diubah ke '${status}'.`,
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelPemesanan = async (req, res, next) => {
  try {
    const { catatan } = req.body;

    if (!catatan) {
      return res.status(400).json({
        status: 'error',
        message: 'Catatan pembatalan wajib diisi.',
      });
    }

    const pemesanan = await pemesananService.cancelPemesanan(
      parseInt(req.params.id),
      catatan,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: 'Pemesanan berhasil dibatalkan.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};
