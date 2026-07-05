const db = require('../../../shared/database/db');

class AuditRepository {
  async findAll({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        al.id_log,
        al.id_customer,
        c.nama_lengkap AS nama_customer,
        al.id_karyawan,
        k.nama_lengkap AS nama_karyawan,
        al.tipe_log,
        al.isi_pesan,
        al.aktivitas,
        al.timestamp,
        al.status,
        al.created_at
      FROM audit_log al
      LEFT JOIN customer c ON al.id_customer = c.id_customer
      LEFT JOIN karyawan k ON al.id_karyawan = k.id_karyawan
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (tipe_log) {
      conditions.push(`al.tipe_log = $${paramIndex++}`);
      params.push(tipe_log);
    }
    if (status) {
      conditions.push(`al.status = $${paramIndex++}`);
      params.push(status);
    }
    if (tanggal_mulai) {
      conditions.push(`al.timestamp >= $${paramIndex++}`);
      params.push(tanggal_mulai);
    }
    if (tanggal_akhir) {
      conditions.push(`al.timestamp <= $${paramIndex++}`);
      params.push(tanggal_akhir + ' 23:59:59');
    }
    if (id_customer) {
      conditions.push(`al.id_customer = $${paramIndex++}`);
      params.push(parseInt(id_customer));
    }
    if (id_karyawan) {
      conditions.push(`al.id_karyawan = $${paramIndex++}`);
      params.push(parseInt(id_karyawan));
    }
    if (search) {
      conditions.push(`(al.isi_pesan ILIKE $${paramIndex} OR al.aktivitas ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT 
        al.id_log,
        al.id_customer,
        c.nama_lengkap AS nama_customer,
        c.email AS email_customer,
        al.id_karyawan,
        k.nama_lengkap AS nama_karyawan,
        k.email AS email_karyawan,
        al.tipe_log,
        al.isi_pesan,
        al.aktivitas,
        al.timestamp,
        al.status,
        al.created_at
      FROM audit_log al
      LEFT JOIN customer c ON al.id_customer = c.id_customer
      LEFT JOIN karyawan k ON al.id_karyawan = k.id_karyawan
      WHERE al.id_log = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async count({ tipe_log, status, tanggal_mulai, tanggal_akhir, id_customer, id_karyawan, search } = {}) {
    let query = 'SELECT COUNT(*) FROM audit_log al';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (tipe_log) {
      conditions.push(`al.tipe_log = $${paramIndex++}`);
      params.push(tipe_log);
    }
    if (status) {
      conditions.push(`al.status = $${paramIndex++}`);
      params.push(status);
    }
    if (tanggal_mulai) {
      conditions.push(`al.timestamp >= $${paramIndex++}`);
      params.push(tanggal_mulai);
    }
    if (tanggal_akhir) {
      conditions.push(`al.timestamp <= $${paramIndex++}`);
      params.push(tanggal_akhir + ' 23:59:59');
    }
    if (id_customer) {
      conditions.push(`al.id_customer = $${paramIndex++}`);
      params.push(parseInt(id_customer));
    }
    if (id_karyawan) {
      conditions.push(`al.id_karyawan = $${paramIndex++}`);
      params.push(parseInt(id_karyawan));
    }
    if (search) {
      conditions.push(`(al.isi_pesan ILIKE $${paramIndex} OR al.aktivitas ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(query, params);
    return parseInt(rows[0].count);
  }
}

module.exports = new AuditRepository();
