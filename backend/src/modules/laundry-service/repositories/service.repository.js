const db = require('../../../shared/database/db');

class ServiceRepository {
  async findAll({ limit, offset } = {}) {
    const { rows } = await db.query(
      'SELECT id_layanan, nama_layanan, jenis_layanan, harga, estimasi_waktu FROM layanan ORDER BY id_layanan LIMIT $1 OFFSET $2',
      [limit || 50, offset || 0]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_layanan, nama_layanan, jenis_layanan, harga, estimasi_waktu FROM layanan WHERE id_layanan = $1',
      [id]
    );
    return rows[0] || null;
  }

  async create({ nama_layanan, jenis_layanan, harga, estimasi_waktu }) {
    const { rows } = await db.query(
      `INSERT INTO layanan (nama_layanan, jenis_layanan, harga, estimasi_waktu)
       VALUES ($1, $2, $3, $4)
       RETURNING id_layanan, nama_layanan, jenis_layanan, harga, estimasi_waktu`,
      [nama_layanan, jenis_layanan, harga, estimasi_waktu]
    );
    return rows[0];
  }

  async update(id, { nama_layanan, jenis_layanan, harga, estimasi_waktu }) {
    const { rows } = await db.query(
      `UPDATE layanan SET nama_layanan = $1, jenis_layanan = $2, harga = $3, estimasi_waktu = $4
       WHERE id_layanan = $5
       RETURNING id_layanan, nama_layanan, jenis_layanan, harga, estimasi_waktu`,
      [nama_layanan, jenis_layanan, harga, estimasi_waktu, id]
    );
    return rows[0];
  }

  async delete(id) {
    const { rows } = await db.query(
      'DELETE FROM layanan WHERE id_layanan = $1 RETURNING id_layanan',
      [id]
    );
    return rows[0];
  }

  async count() {
    const { rows } = await db.query('SELECT COUNT(*) FROM layanan');
    return parseInt(rows[0].count);
  }
}

module.exports = new ServiceRepository();
