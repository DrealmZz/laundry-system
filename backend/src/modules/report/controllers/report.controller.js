const reportService = require('../services/report.service');

exports.getFinanceReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const report = await reportService.getFinanceReport({ start_date, end_date });

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const summary = await reportService.getSummary({ start_date, end_date });

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDailyReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const report = await reportService.getDailyReport({ start_date, end_date });

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

exports.getShiftPerformance = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const report = await reportService.getShiftPerformance({ start_date, end_date });

    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
};

exports.getProfitLoss = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const report = await reportService.getProfitLoss({ start_date, end_date });

    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
};

exports.getOperationalCosts = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date dan end_date wajib diisi sebagai query parameter.',
      });
    }

    const costs = await reportService.getOperationalCosts({ start_date, end_date });

    res.status(200).json({ status: 'success', data: costs });
  } catch (err) {
    next(err);
  }
};

exports.createOperationalCost = async (req, res, next) => {
  try {
    const { tanggal, kategori, jumlah, deskripsi } = req.body;
    const created = await reportService.createOperationalCost({ tanggal, kategori, jumlah, deskripsi });
    res.status(201).json({ status: 'success', data: created, message: 'Biaya operasional berhasil ditambahkan.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteOperationalCost = async (req, res, next) => {
  try {
    await reportService.deleteOperationalCost(req.params.id);
    res.status(200).json({ status: 'success', message: 'Biaya operasional berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};

exports.getSalesTarget = async (req, res, next) => {
  try {
    const { periode } = req.query;
    const target = await reportService.getSalesTarget(periode);
    res.status(200).json({ status: 'success', data: target });
  } catch (err) {
    next(err);
  }
};

exports.setSalesTarget = async (req, res, next) => {
  try {
    const { periode, target_amount } = req.body;
    const id_owner = req.user && req.user.id ? req.user.id : null;
    const saved = await reportService.setSalesTarget({ periode, target_amount, id_owner });
    res.status(200).json({ status: 'success', data: saved, message: 'Target penjualan berhasil disimpan.' });
  } catch (err) {
    next(err);
  }
};
