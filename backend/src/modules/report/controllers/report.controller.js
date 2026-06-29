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
