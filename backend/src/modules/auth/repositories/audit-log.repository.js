const db = require('../../../shared/database/db');

class AuditLogRepository {
  async create({ userId, userTable, action, message }) {
    const id_customer = userTable === 'customer' ? userId : null;
    const id_karyawan = userTable === 'karyawan' ? userId : null;

    await db.query(
      `INSERT INTO audit_log (id_customer, id_karyawan, tipe_log, isi_pesan, aktivitas, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id_customer, id_karyawan, action, message || action, action, action.includes('FAILED') ? 'gagal' : 'berhasil']
    );
  }
}

module.exports = new AuditLogRepository();
