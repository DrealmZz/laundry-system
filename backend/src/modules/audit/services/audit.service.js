const auditRepository = require('../repositories/audit.repository');

class AuditService {
  async getAllAuditLogs({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search, page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;
    const auditLogs = await auditRepository.findAll({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search, limit, offset });
    const total = await auditRepository.count({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search });

    return {
      items: auditLogs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async getAuditLogById(id) {
    const auditLog = await auditRepository.findById(id);
    if (!auditLog) {
      throw Object.assign(new Error('Audit log tidak ditemukan.'), { statusCode: 404 });
    }
    return auditLog;
  }
}

module.exports = new AuditService();
