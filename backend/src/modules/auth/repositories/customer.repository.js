const db = require('../../../shared/database/db');

class CustomerRepository {
  async findByLogin(identifier) {
    const { rows } = await db.query(
      `SELECT id_customer, nama_lengkap, username, no_hp, email, password, status_akun, alamat
       FROM customer
       WHERE username = $1 OR email = $1 OR no_hp = $1`,
      [identifier]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_customer, nama_lengkap, username, no_hp, email, status_akun, alamat, created_at, tanggal_daftar FROM customer WHERE id_customer = $1',
      [id]
    );
    return rows[0] || null;
  }

  async emailExists(email) {
    const { rows } = await db.query('SELECT 1 FROM customer WHERE email = $1', [email]);
    return rows.length > 0;
  }

  async usernameExists(username) {
    const { rows } = await db.query('SELECT 1 FROM customer WHERE username = $1', [username]);
    return rows.length > 0;
  }

  async create({ nama_lengkap, username, no_hp, email, password, alamat }) {
    const { rows } = await db.query(
      `INSERT INTO customer (nama_lengkap, username, no_hp, email, password, alamat)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_customer, nama_lengkap, username, no_hp, email, status_akun, alamat, created_at`,
      [nama_lengkap, username, no_hp || null, email, password, alamat || null]
    );
    return rows[0];
  }

  async updatePassword(id, hashedPassword) {
    await db.query('UPDATE customer SET password = $1 WHERE id_customer = $2', [hashedPassword, id]);
  }

  async setStatus(id, status) {
    await db.query('UPDATE customer SET status_akun = $1 WHERE id_customer = $2', [status, id]);
  }

  async findAll({ limit, offset } = {}) {
    const { rows } = await db.query(
      'SELECT id_customer, nama_lengkap, username, no_hp, email, status_akun, alamat, created_at FROM customer ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit || 50, offset || 0]
    );
    return rows;
  }

  async count() {
    const { rows } = await db.query('SELECT COUNT(*) FROM customer');
    return parseInt(rows[0].count);
  }

  async update(id, { nama_lengkap, no_hp, email, alamat, status_akun }) {
    const { rows } = await db.query(
      `UPDATE customer SET nama_lengkap = $1, no_hp = $2, email = $3, alamat = $4, status_akun = $5
       WHERE id_customer = $6
       RETURNING id_customer, nama_lengkap, username, no_hp, email, status_akun, alamat`,
      [nama_lengkap, no_hp, email, alamat, status_akun, id]
    );
    return rows[0];
  }
}

module.exports = new CustomerRepository();
