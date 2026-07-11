const db = require('../../../shared/database/db');

class PemesananRepository {
  async create({ id_customer, id_layanan, mesin_ids, tanggal_pesanan, shift, jam_mulai, status_pesanan, berat_kg, jenis_pencucian, metode_pengambilan, catatan }) {
    const { rows } = await db.query(
      `INSERT INTO pemesanan (id_customer, id_layanan, tanggal_pesanan, shift, jam_mulai, status_pesanan, berat_kg, jenis_pencucian, metode_pengambilan, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id_customer, id_layanan, tanggal_pesanan, shift, jam_mulai || null, status_pesanan, berat_kg || null, jenis_pencucian, metode_pengambilan, catatan || null]
    );

    const pemesanan = rows[0];

    if (mesin_ids && Array.isArray(mesin_ids) && mesin_ids.length > 0) {
      const values = mesin_ids.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
      const params = mesin_ids.flatMap(id => [pemesanan.id_pemesanan, id]);
      await db.query(
        `INSERT INTO booking_mesin (id_pemesanan, id_mesin) VALUES ${values}
         ON CONFLICT (id_pemesanan, id_mesin) DO NOTHING`,
        params
      );
    }

    return pemesanan;
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT p.*, l.nama_layanan, l.jenis_layanan AS layanan_jenis, l.harga,
               c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp, c.alamat AS customer_alamat,
               bm.id_mesin AS mesin_booking_id, mc.kode_mesin, mc.nama_mesin,
               t.id_transaksi, t.nomor_struk, t.total AS total_transaksi,
               t.metode_pembayaran, t.status_pembayaran, t.tanggal_transaksi
       FROM pemesanan p
       JOIN layanan l ON p.id_layanan = l.id_layanan
       JOIN customer c ON p.id_customer = c.id_customer
       LEFT JOIN booking_mesin bm ON p.id_pemesanan = bm.id_pemesanan
       LEFT JOIN mesin_cuci mc ON bm.id_mesin = mc.id_mesin
       LEFT JOIN transaksi t ON p.id_pemesanan = t.id_pemesanan
       WHERE p.id_pemesanan = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findAll({ id_customer, status_pesanan, limit, offset } = {}) {
    let query = `SELECT p.*, l.nama_layanan, l.jenis_layanan AS layanan_jenis, l.harga,
                          c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp, c.alamat AS customer_alamat,
                          bm.id_mesin AS mesin_booking_id, mc.kode_mesin, mc.nama_mesin,
                         t.id_transaksi, t.nomor_struk, t.total AS total_transaksi,
                         t.metode_pembayaran, t.status_pembayaran, t.tanggal_transaksi
                 FROM pemesanan p
                 JOIN layanan l ON p.id_layanan = l.id_layanan
                 JOIN customer c ON p.id_customer = c.id_customer
                 LEFT JOIN booking_mesin bm ON p.id_pemesanan = bm.id_pemesanan
                 LEFT JOIN mesin_cuci mc ON bm.id_mesin = mc.id_mesin
                 LEFT JOIN transaksi t ON p.id_pemesanan = t.id_pemesanan`;
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

  async updateMetodePengambilan(id, metode_pengambilan) {
    const { rows } = await db.query(
      'UPDATE pemesanan SET metode_pengambilan = $1 WHERE id_pemesanan = $2 RETURNING *',
      [metode_pengambilan, id]
    );
    return rows[0];
  }

  async findByStatuses(statuses) {
    const { rows } = await db.query(
      `SELECT p.*, l.nama_layanan, c.nama_lengkap AS customer_nama,
              bm.id_mesin AS mesin_booking_id, mc.kode_mesin, mc.nama_mesin,
              t.id_transaksi, t.nomor_struk, t.total AS total_transaksi,
              t.metode_pembayaran, t.status_pembayaran, t.tanggal_transaksi
       FROM pemesanan p
       JOIN layanan l ON p.id_layanan = l.id_layanan
       JOIN customer c ON p.id_customer = c.id_customer
       LEFT JOIN booking_mesin bm ON p.id_pemesanan = bm.id_pemesanan
       LEFT JOIN mesin_cuci mc ON bm.id_mesin = mc.id_mesin
       LEFT JOIN transaksi t ON p.id_pemesanan = t.id_pemesanan
       WHERE p.status_pesanan = ANY($1)`,
      [statuses]
    );
    return rows;
  }
}

module.exports = new PemesananRepository();
