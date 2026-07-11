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

  async findAllWithCurrentBooking() {
    const { rows } = await db.query(
      `SELECT mc.*, bj.id_pemesanan, bj.jam_mulai, bj.status_pesanan AS booking_status,
              bj.estimasi_waktu, bj.customer_nama
       FROM mesin_cuci mc
       LEFT JOIN LATERAL (
         SELECT p.id_pemesanan, p.jam_mulai, p.status_pesanan,
                l.estimasi_waktu, c.nama_lengkap AS customer_nama
         FROM booking_mesin bm
         JOIN pemesanan p ON bm.id_pemesanan = p.id_pemesanan
         JOIN layanan l ON p.id_layanan = l.id_layanan
         JOIN customer c ON p.id_customer = c.id_customer
         WHERE bm.id_mesin = mc.id_mesin
           AND p.status_pesanan NOT IN ('selesai', 'pesanan ditolak', 'pesanan dibatalkan')
         ORDER BY p.tanggal_pesanan DESC, p.jam_mulai DESC
         LIMIT 1
       ) bj ON true
       ORDER BY mc.kode_mesin ASC`,
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

  async update(id, { tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
    const { rows } = await db.query(
      `UPDATE mesin_cuci 
       SET tipe_mesin = $1, nama_mesin = $2, kapasitas_kg = $3, konsumsi_kwh = $4, penggunaan_air_liter = $5
       WHERE id_mesin = $6
       RETURNING *`,
      [tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter, id]
    );
    return rows[0];
  }

  async delete(id) {
    const { rows } = await db.query(
      'DELETE FROM mesin_cuci WHERE id_mesin = $1 RETURNING *',
      [id]
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
