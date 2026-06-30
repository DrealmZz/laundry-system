const db = require('../../../shared/database/db');

class TransaksiRepository {
  async create({ id_pemesanan, id_customer, id_karyawan, nomor_struk, total, metode_pembayaran, status_pembayaran }) {
    const { rows } = await db.query(
      `INSERT INTO transaksi (id_pemesanan, id_customer, id_karyawan, nomor_struk, total, metode_pembayaran, status_pembayaran)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id_pemesanan, id_customer, id_karyawan, nomor_struk, total, metode_pembayaran, status_pembayaran || 'lunas']
    );
    return rows[0];
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT t.*, 
              p.status_pesanan, p.berat_kg, p.jenis_pencucian, p.tanggal_pesanan,
              c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp,
              k.nama_lengkap AS karyawan_nama,
              l.nama_layanan, l.harga
       FROM transaksi t
       JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
       JOIN customer c ON t.id_customer = c.id_customer
       JOIN karyawan k ON t.id_karyawan = k.id_karyawan
       JOIN layanan l ON p.id_layanan = l.id_layanan
       WHERE t.id_transaksi = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByStruk(nomor_struk) {
    const { rows } = await db.query(
      `SELECT t.*, 
              p.status_pesanan, p.berat_kg, p.jenis_pencucian, p.tanggal_pesanan,
              c.nama_lengkap AS customer_nama, c.no_hp AS customer_no_hp,
              k.nama_lengkap AS karyawan_nama,
              l.nama_layanan, l.harga
       FROM transaksi t
       JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
       JOIN customer c ON t.id_customer = c.id_customer
       JOIN karyawan k ON t.id_karyawan = k.id_karyawan
       JOIN layanan l ON p.id_layanan = l.id_layanan
       WHERE t.nomor_struk = $1`,
      [nomor_struk]
    );
    return rows[0] || null;
  }

  async findAll({ id_customer, status_pembayaran, start_date, end_date, limit, offset } = {}) {
    let query = `SELECT t.*, 
                        p.status_pesanan, p.berat_kg, p.jenis_pencucian,
                        c.nama_lengkap AS customer_nama,
                        k.nama_lengkap AS karyawan_nama,
                        l.nama_layanan
                 FROM transaksi t
                 JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
                 JOIN customer c ON t.id_customer = c.id_customer
                 JOIN karyawan k ON t.id_karyawan = k.id_karyawan
                 JOIN layanan l ON p.id_layanan = l.id_layanan`;
    const params = [];
    const conditions = [];

    if (id_customer) {
      conditions.push(`t.id_customer = $${params.length + 1}`);
      params.push(id_customer);
    }

    if (status_pembayaran) {
      conditions.push(`t.status_pembayaran = $${params.length + 1}`);
      params.push(status_pembayaran);
    }

    if (start_date) {
      conditions.push(`t.tanggal_transaksi >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`t.tanggal_transaksi <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY t.tanggal_transaksi DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit || 50, offset || 0);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async count({ id_customer, status_pembayaran, start_date, end_date } = {}) {
    let query = 'SELECT COUNT(*) FROM transaksi t';
    const params = [];
    const conditions = [];

    if (id_customer) {
      conditions.push(`t.id_customer = $${params.length + 1}`);
      params.push(id_customer);
    }

    if (status_pembayaran) {
      conditions.push(`t.status_pembayaran = $${params.length + 1}`);
      params.push(status_pembayaran);
    }

    if (start_date) {
      conditions.push(`t.tanggal_transaksi >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`t.tanggal_transaksi <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await db.query(query, params);
    return parseInt(rows[0].count);
  }

  async existsByPemesanan(id_pemesanan) {
    const { rows } = await db.query(
      "SELECT 1 FROM transaksi WHERE id_pemesanan = $1 AND status_pembayaran = 'lunas'",
      [id_pemesanan]
    );
    return rows.length > 0;
  }
}

module.exports = new TransaksiRepository();
