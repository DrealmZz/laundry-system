const auditService = require('../services/audit.service');

exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const { tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search, page, limit } = req.query;
    const result = await auditService.getAllAuditLogs({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search, page, limit });

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Daftar audit log berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auditLog = await auditService.getAuditLogById(parseInt(id));

    res.status(200).json({
      status: 'success',
      data: auditLog,
      message: 'Detail audit log berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};
