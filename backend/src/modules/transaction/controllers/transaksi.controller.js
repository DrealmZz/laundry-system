const transaksiService = require('../services/transaksi.service');

exports.createTransaksi = async (req, res, next) => {
  try {
    const { id_pemesanan, metode_pembayaran } = req.body;

    if (!id_pemesanan || !metode_pembayaran) {
      return res.status(400).json({
        status: 'error',
        message: 'id_pemesanan dan metode_pembayaran wajib diisi.',
      });
    }

    const transaksi = await transaksiService.createTransaksi({
      id_pemesanan,
      id_karyawan: req.user.id,
      metode_pembayaran,
    });

    res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat. Pembayaran lunas.',
      data: transaksi,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTransaksi = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { status_pembayaran, start_date, end_date } = req.query;

    const result = await transaksiService.getAllTransaksi({
      status_pembayaran,
      start_date,
      end_date,
      limit,
      offset,
    });

    res.status(200).json({
      status: 'success',
      data: result.transaksi,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransaksiById = async (req, res, next) => {
  try {
    const transaksi = await transaksiService.getTransaksiById(parseInt(req.params.id));

    res.status(200).json({
      status: 'success',
      data: transaksi,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransaksiByStruk = async (req, res, next) => {
  try {
    const transaksi = await transaksiService.getTransaksiByStruk(req.params.nomor_struk);

    res.status(200).json({
      status: 'success',
      data: transaksi,
    });
  } catch (err) {
    next(err);
  }
};
