const db = require('../../../shared/database/db');

class MachineRepository {
  async findAll() {
    const { rows } = await db.query(
      'SELECT * FROM mesin_cuci ORDER BY kode_mesin ASC',
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT * FROM mesin_cuci WHERE id_mesin = $1',
      [id],
    );
    return rows[0] || null;
  }

  async findAvailableByDateAndShift(tanggal, shift) {
    const { rows } = await db.query(
      `SELECT * FROM mesin_cuci 
       WHERE status_mesin = 'tersedia'
       AND id_mesin NOT IN (
         SELECT bm.id_mesin FROM booking_mesin bm
         JOIN pemesanan p ON bm.id_pemesanan = p.id_pemesanan
         WHERE p.tanggal_pesanan = $1 AND p.shift = $2 
         AND p.status_pesanan NOT IN ('selesai', 'pesanan ditolak')
       )
       ORDER BY kode_mesin ASC`,
      [tanggal, shift],
    );
    return rows;
  }

  async findByKode(kode_mesin) {
    const { rows } = await db.query(
      'SELECT * FROM mesin_cuci WHERE kode_mesin = $1',
      [kode_mesin]
    );
    return rows[0] || null;
  }

  async create({ kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
    const { rows } = await db.query(
      `INSERT INTO mesin_cuci (kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter]
    );
    return rows[0];
  }

  async update(id, { nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
    const { rows } = await db.query(
      `UPDATE mesin_cuci 
       SET nama_mesin = $1, kapasitas_kg = $2, konsumsi_kwh = $3, penggunaan_air_liter = $4
       WHERE id_mesin = $5
       RETURNING *`,
      [nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter, id]
    );
    return rows[0];
  }

  async updateStatus(id, status_mesin) {
    const { rows } = await db.query(
      'UPDATE mesin_cuci SET status_mesin = $1 WHERE id_mesin = $2 RETURNING *',
      [status_mesin, id]
    );
    return rows[0];
  }
}

module.exports = new MachineRepository();
