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
         SELECT id_mesin FROM pemesanan 
         WHERE tanggal_pesanan = $1 AND shift = $2 
         AND status_pesanan NOT IN ('selesai', 'pesanan ditolak')
       )
       ORDER BY kode_mesin ASC`,
      [tanggal, shift],
    );
    return rows;
  }
}

module.exports = new MachineRepository();
