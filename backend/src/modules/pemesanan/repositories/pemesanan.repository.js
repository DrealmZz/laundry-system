const db = require('../../../shared/database/db');

class PemesananRepository {
  async create({ id_customer, id_layanan, id_mesin, tanggal_pesanan, shift, status_pesanan, berat_kg, jenis_pencucian, metode_pengambilan, catatan }) {
    const { rows } = await db.query(
      `INSERT INTO pemesanan (id_customer, id_layanan, id_mesin, tanggal_pesanan, shift, status_pesanan, berat_kg, jenis_pencucian, metode_pengambilan, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id_customer, id_layanan, id_mesin || null, tanggal_pesanan, shift, status_pesanan, berat_kg || null, jenis_pencucian, metode_pengambilan, catatan || null]
    );
    return rows[0];
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT p.*, l.nama_layanan, l.jenis_layanan AS layanan_jenis, l.harga,
              c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp
       FROM pemesanan p
       JOIN layanan l ON p.id_layanan = l.id_layanan
       JOIN customer c ON p.id_customer = c.id_customer
       WHERE p.id_pemesanan = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findAll({ id_customer, status_pesanan, limit, offset } = {}) {
    let query = `SELECT p.*, l.nama_layanan, l.jenis_layanan AS layanan_jenis, l.harga,
                        c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp
                 FROM pemesanan p
                 JOIN layanan l ON p.id_layanan = l.id_layanan
                 JOIN customer c ON p.id_customer = c.id_customer`;
    const params = [];
    const conditions = [];

    if (id_customer) {
      conditions.push(`p.id_customer = $${params.length + 1}`);
      params.push(id_customer);
    }

    if (status_pesanan) {
      conditions.push(`p.status_pesanan = $${params.length + 1}`);
      params.push(status_pesanan);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY p.tanggal_pesanan DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit || 50, offset || 0);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async count({ id_customer, status_pesanan } = {}) {
    let query = 'SELECT COUNT(*) FROM pemesanan';
    const params = [];
    const conditions = [];

    if (id_customer) {
      conditions.push(`id_customer = $${params.length + 1}`);
      params.push(id_customer);
    }

    if (status_pesanan) {
      conditions.push(`status_pesanan = $${params.length + 1}`);
      params.push(status_pesanan);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(query, params);
    return parseInt(rows[0].count);
  }

  async updateStatus(id, status_pesanan) {
    const { rows } = await db.query(
      'UPDATE pemesanan SET status_pesanan = $1 WHERE id_pemesanan = $2 RETURNING *',
      [status_pesanan, id]
    );
    return rows[0];
  }

  async cancel(id, catatan, status = 'pesanan ditolak') {
    const { rows } = await db.query(
      'UPDATE pemesanan SET status_pesanan = $1, catatan = $2 WHERE id_pemesanan = $3 RETURNING *',
      [status, catatan, id]
    );
    return rows[0];
  }

  async updateWeight(id, berat_kg) {
    const { rows } = await db.query(
      'UPDATE pemesanan SET berat_kg = $1 WHERE id_pemesanan = $2 RETURNING *',
      [berat_kg, id]
    );
    return rows[0];
  }

  async updateDeliverySchedule(id, { tanggal_pengiriman, shift_pengiriman }) {
    const { rows } = await db.query(
      'UPDATE pemesanan SET tanggal_pengiriman = $1, shift_pengiriman = $2 WHERE id_pemesanan = $3 RETURNING *',
      [tanggal_pengiriman, shift_pengiriman, id]
    );
    return rows[0];
  }

  async findByStatuses(statuses) {
    const { rows } = await db.query(
      `SELECT p.*, l.nama_layanan, c.nama_lengkap AS customer_nama
       FROM pemesanan p
       JOIN layanan l ON p.id_layanan = l.id_layanan
       JOIN customer c ON p.id_customer = c.id_customer
       WHERE p.status_pesanan = ANY($1)`,
      [statuses]
    );
    return rows;
  }
}

module.exports = new PemesananRepository();
