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
    const { status_pesanan } = req.body;

    if (!status_pesanan) {
      return res.status(400).json({
        status: 'error',
        message: 'status_pesanan wajib diisi.',
      });
    }

    const pemesanan = await pemesananService.updateStatus(
      parseInt(req.params.id),
      status_pesanan,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: `Status pemesanan berhasil diubah ke '${status_pesanan}'.`,
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
      req.user.role,
      req.user.id
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

exports.confirmPickup = async (req, res, next) => {
  try {
    const pemesanan = await pemesananService.confirmPickup(
      parseInt(req.params.id),
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: 'Konfirmasi jemput berhasil.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmClothesReceived = async (req, res, next) => {
  try {
    const pemesanan = await pemesananService.confirmClothesReceived(
      parseInt(req.params.id),
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: 'Konfirmasi pakaian diterima berhasil.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.weighAndNotify = async (req, res, next) => {
  try {
    const { berat_kg } = req.body;

    if (!berat_kg || berat_kg <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'berat_kg harus lebih dari 0.',
      });
    }

    const pemesanan = await pemesananService.weighAndNotify(
      parseInt(req.params.id),
      parseFloat(berat_kg),
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: 'Berat berhasil diinput dan notifikasi terkirim.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.generateQR = async (req, res, next) => {
  try {
    const qrData = await pemesananService.generateQR(
      parseInt(req.params.id),
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: qrData,
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const pemesanan = await pemesananService.confirmPayment(
      parseInt(req.params.id),
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Konfirmasi pembayaran berhasil.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.setDeliverySchedule = async (req, res, next) => {
  try {
    const { tanggal_pengiriman, shift_pengiriman } = req.body;

    if (!tanggal_pengiriman || !shift_pengiriman) {
      return res.status(400).json({
        status: 'error',
        message: 'tanggal_pengiriman dan shift_pengiriman wajib diisi.',
      });
    }

    const pemesanan = await pemesananService.setDeliverySchedule(
      parseInt(req.params.id),
      { tanggal_pengiriman, shift_pengiriman },
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Jadwal pengiriman berhasil disimpan.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmReceived = async (req, res, next) => {
  try {
    const pemesanan = await pemesananService.confirmReceived(
      parseInt(req.params.id),
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Pesanan berhasil dikonfirmasi diterima.',
      data: pemesanan,
    });
  } catch (err) {
    next(err);
  }
};
