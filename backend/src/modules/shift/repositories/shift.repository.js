const db = require('../../../shared/database/db');

class ShiftRepository {
  async findAll({ tanggal, nama_shift, limit = 20, offset = 0 } = {}) {
    let query = 'SELECT id_shift, nama_shift, tanggal, jam_mulai, jam_selesai, created_at FROM shifts';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (tanggal) {
      conditions.push(`tanggal = $${paramIndex++}`);
      params.push(tanggal);
    }
    if (nama_shift) {
      conditions.push(`nama_shift = $${paramIndex++}`);
      params.push(nama_shift);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY tanggal DESC, 
      CASE nama_shift 
        WHEN 'pagi' THEN 1 
        WHEN 'siang' THEN 2 
        WHEN 'sore' THEN 3 
        WHEN 'malam' THEN 4 
      END`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_shift, nama_shift, tanggal, jam_mulai, jam_selesai, created_at FROM shifts WHERE id_shift = $1',
      [id]
    );
    return rows[0] || null;
  }

  async findByTanggalAndShift({ tanggal, nama_shift }) {
    const { rows } = await db.query(
      'SELECT id_shift FROM shifts WHERE tanggal = $1 AND nama_shift = $2',
      [tanggal, nama_shift]
    );
    return rows[0] || null;
  }

  async create({ nama_shift, tanggal, jam_mulai, jam_selesai }) {
    const { rows } = await db.query(
      `INSERT INTO shifts (nama_shift, tanggal, jam_mulai, jam_selesai)
       VALUES ($1, $2, $3, $4)
       RETURNING id_shift, nama_shift, tanggal, jam_mulai, jam_selesai, created_at`,
      [nama_shift, tanggal, jam_mulai, jam_selesai]
    );
    return rows[0];
  }

  async update(id, { jam_mulai, jam_selesai }) {
    const { rows } = await db.query(
      `UPDATE shifts SET jam_mulai = $1, jam_selesai = $2
       WHERE id_shift = $3
       RETURNING id_shift, nama_shift, tanggal, jam_mulai, jam_selesai, created_at`,
      [jam_mulai, jam_selesai, id]
    );
    return rows[0];
  }

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM shifts WHERE id_shift = $1', [id]);
    return rowCount > 0;
  }

  async count({ tanggal, nama_shift } = {}) {
    let query = 'SELECT COUNT(*) FROM shifts';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (tanggal) {
      conditions.push(`tanggal = $${paramIndex++}`);
      params.push(tanggal);
    }
    if (nama_shift) {
      conditions.push(`nama_shift = $${paramIndex++}`);
      params.push(nama_shift);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(query, params);
    return parseInt(rows[0].count);
  }

  async findKaryawanByShiftId(shiftId) {
    const { rows } = await db.query(
      `SELECT k.id_karyawan, k.nama_lengkap, k.role, k.no_hp, k.email
       FROM karyawan k
       JOIN shift_karyawan sk ON k.id_karyawan = sk.id_karyawan
       WHERE sk.id_shift = $1
       ORDER BY k.nama_lengkap`,
      [shiftId]
    );
    return rows;
  }

  async assignKaryawan({ id_shift, id_karyawan }) {
    try {
      const { rows } = await db.query(
        'INSERT INTO shift_karyawan (id_shift, id_karyawan) VALUES ($1, $2) RETURNING id_shift_karyawan',
        [id_shift, id_karyawan]
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') { // unique_violation
        return null;
      }
      throw err;
    }
  }

  async unassignKaryawan({ id_shift, id_karyawan }) {
    const { rowCount } = await db.query(
      'DELETE FROM shift_karyawan WHERE id_shift = $1 AND id_karyawan = $2',
      [id_shift, id_karyawan]
    );
    return rowCount > 0;
  }

  async isKaryawanAssigned({ id_shift, id_karyawan }) {
    const { rows } = await db.query(
      'SELECT 1 FROM shift_karyawan WHERE id_shift = $1 AND id_karyawan = $2',
      [id_shift, id_karyawan]
    );
    return rows.length > 0;
  }
}

module.exports = new ShiftRepository();
