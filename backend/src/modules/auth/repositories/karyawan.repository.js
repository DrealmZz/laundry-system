const db = require('../../../shared/database/db');

class KaryawanRepository {
  async findByLogin(identifier) {
    const { rows } = await db.query(
      `SELECT id_karyawan, nama_lengkap, username, no_hp, email, password, role, hak_akses, status_akun, alamat
       FROM karyawan
       WHERE username = $1 OR email = $1`,
      [identifier]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_karyawan, nama_lengkap, username, no_hp, email, role, hak_akses, status_akun, alamat, created_at FROM karyawan WHERE id_karyawan = $1',
      [id]
    );
    return rows[0] || null;
  }

  async emailExists(email) {
    const { rows } = await db.query('SELECT 1 FROM karyawan WHERE email = $1', [email]);
    return rows.length > 0;
  }

  async usernameExists(username) {
    const { rows } = await db.query('SELECT 1 FROM karyawan WHERE username = $1', [username]);
    return rows.length > 0;
  }

  async create({ nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat }) {
    const { rows } = await db.query(
      `INSERT INTO karyawan (nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id_karyawan, nama_lengkap, username, no_hp, email, role, hak_akses, status_akun, created_at`,
      [nama_lengkap, username, no_hp || null, email, password, role, hak_akses || null, alamat || null]
    );
    return rows[0];
  }

  async updatePassword(id, hashedPassword) {
    await db.query('UPDATE karyawan SET password = $1 WHERE id_karyawan = $2', [hashedPassword, id]);
  }

  async setStatus(id, status) {
    await db.query('UPDATE karyawan SET status_akun = $1 WHERE id_karyawan = $2', [status, id]);
  }

  async findAll({ role, limit, offset } = {}) {
    let query = 'SELECT id_karyawan, nama_lengkap, username, no_hp, email, role, hak_akses, status_akun, created_at FROM karyawan';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit || 50, offset || 0);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async count(role) {
    if (role) {
      const { rows } = await db.query('SELECT COUNT(*) FROM karyawan WHERE role = $1', [role]);
      return parseInt(rows[0].count);
    }
    const { rows } = await db.query('SELECT COUNT(*) FROM karyawan');
    return parseInt(rows[0].count);
  }

  async update(id, { nama_lengkap, no_hp, email, role, hak_akses, alamat, status_akun }) {
    const { rows } = await db.query(
      `UPDATE karyawan SET nama_lengkap = $1, no_hp = $2, email = $3, role = $4, hak_akses = $5, alamat = $6, status_akun = $7
       WHERE id_karyawan = $8
       RETURNING id_karyawan, nama_lengkap, username, no_hp, email, role, hak_akses, status_akun`,
      [nama_lengkap, no_hp, email, role, hak_akses, alamat, status_akun, id]
    );
    return rows[0];
  }
}

module.exports = new KaryawanRepository();
