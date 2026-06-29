const serviceService = require('../services/service.service');

exports.getAllServices = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const result = await serviceService.getAllServices({ limit, offset });

    res.status(200).json({
      status: 'success',
      data: result.services,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(parseInt(req.params.id));

    res.status(200).json({
      status: 'success',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Layanan berhasil dibuat.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(parseInt(req.params.id), req.body);

    res.status(200).json({
      status: 'success',
      message: 'Layanan berhasil diupdate.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    await serviceService.deleteService(parseInt(req.params.id));

    res.status(200).json({
      status: 'success',
      message: 'Layanan berhasil dihapus.',
    });
  } catch (err) {
    next(err);
  }
};
