const db = require('../../../shared/database/db');

class ReportRepository {
  async getRevenueSummary({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) AS total_transaksi,
         COALESCE(SUM(total), 0) AS total_revenue,
         COALESCE(AVG(total), 0) AS rata_rata_per_transaksi
       FROM transaksi
       WHERE status_pembayaran = 'lunas'
         AND tanggal_transaksi >= $1
         AND tanggal_transaksi < ($2::date + INTERVAL '1 day')`,
      [start_date, end_date]
    );
    return rows[0];
  }

  async getRevenueByPaymentMethod({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT metode_pembayaran, COUNT(*) AS jumlah, COALESCE(SUM(total), 0) AS total
       FROM transaksi
       WHERE status_pembayaran = 'lunas'
         AND tanggal_transaksi >= $1
         AND tanggal_transaksi < ($2::date + INTERVAL '1 day')
       GROUP BY metode_pembayaran
       ORDER BY total DESC`,
      [start_date, end_date]
    );
    return rows;
  }

  async getDailyRevenue({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT DATE(tanggal_transaksi) AS tanggal,
              COUNT(*) AS jumlah_transaksi,
              COALESCE(SUM(total), 0) AS total_revenue
       FROM transaksi
       WHERE status_pembayaran = 'lunas'
         AND tanggal_transaksi >= $1
         AND tanggal_transaksi < ($2::date + INTERVAL '1 day')
       GROUP BY DATE(tanggal_transaksi)
       ORDER BY tanggal`,
      [start_date, end_date]
    );
    return rows;
  }

  // ── Shift Performance (dari pemesanan.shift) ──
  async getShiftPerformance({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT p.shift,
              COUNT(t.id_transaksi) AS total_transaksi,
              COALESCE(SUM(t.total), 0) AS total_revenue,
              COALESCE(SUM(CASE WHEN p.jenis_pencucian = 'kiloan' THEN p.berat_kg ELSE 0 END), 0) AS total_kg,
              COUNT(CASE WHEN p.jenis_pencucian = 'koin' THEN 1 END) AS total_koin
       FROM transaksi t
       JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
       WHERE t.status_pembayaran = 'lunas'
         AND t.tanggal_transaksi >= $1
         AND t.tanggal_transaksi < ($2::date + INTERVAL '1 day')
       GROUP BY p.shift
       ORDER BY CASE p.shift
                  WHEN 'pagi' THEN 1
                  WHEN 'siang' THEN 2
                  WHEN 'sore' THEN 3
                  WHEN 'malam' THEN 4
                  ELSE 5
                END`,
      [start_date, end_date]
    );
    return rows;
  }

  // ── Total kg cucian selesai (untuk cost per kg) ──
  async getTotalWeight({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(p.berat_kg), 0) AS total_kg
       FROM transaksi t
       JOIN pemesanan p ON t.id_pemesanan = p.id_pemesanan
       WHERE t.status_pembayaran = 'lunas'
         AND t.tanggal_transaksi >= $1
         AND t.tanggal_transaksi < ($2::date + INTERVAL '1 day')`,
      [start_date, end_date]
    );
    return parseFloat(rows[0].total_kg) || 0;
  }

  // ── Operational Costs ──
  async getOperationalCosts({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT id, tanggal, kategori, jumlah, satuan, deskripsi, created_at
       FROM operational_costs
       WHERE tanggal >= $1 AND tanggal <= $2
       ORDER BY tanggal DESC, id DESC`,
      [start_date, end_date]
    );
    return rows;
  }

  async getOperationalCostSummary({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT kategori, COALESCE(SUM(jumlah), 0) AS total
       FROM operational_costs
       WHERE tanggal >= $1 AND tanggal <= $2
       GROUP BY kategori
       ORDER BY total DESC`,
      [start_date, end_date]
    );
    return rows;
  }

  async createOperationalCost({ tanggal, kategori, jumlah, deskripsi }) {
    const { rows } = await db.query(
      `INSERT INTO operational_costs (tanggal, kategori, jumlah, deskripsi)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tanggal, kategori, jumlah, satuan, deskripsi, created_at`,
      [tanggal, kategori, jumlah, deskripsi]
    );
    return rows[0];
  }

  async deleteOperationalCost(id) {
    const { rows } = await db.query(
      'DELETE FROM operational_costs WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0];
  }

  // ── Sales Target ──
  async getSalesTarget(periode) {
    const { rows } = await db.query(
      'SELECT id, periode, target_amount, created_at, updated_at FROM sales_targets WHERE periode = $1',
      [periode]
    );
    return rows[0] || null;
  }

  async upsertSalesTarget({ periode, target_amount, id_owner }) {
    const { rows } = await db.query(
      `INSERT INTO sales_targets (periode, target_amount, id_owner, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (periode)
       DO UPDATE SET target_amount = EXCLUDED.target_amount, id_owner = EXCLUDED.id_owner, updated_at = NOW()
       RETURNING id, periode, target_amount, created_at, updated_at`,
      [periode, target_amount, id_owner]
    );
    return rows[0];
  }

  async getPemesananByStatus({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT status_pesanan, COUNT(*) AS jumlah
       FROM pemesanan
       WHERE tanggal_pesanan >= $1
         AND tanggal_pesanan <= $2
       GROUP BY status_pesanan
       ORDER BY jumlah DESC`,
      [start_date, end_date]
    );
    return rows;
  }

  async getNewCustomers({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT COUNT(*) AS customer_baru
       FROM customer
       WHERE tanggal_daftar >= $1
         AND tanggal_daftar <= $2`,
      [start_date, end_date]
    );
    return parseInt(rows[0].customer_baru);
  }

  async getActiveKaryawan() {
    const { rows } = await db.query(
      "SELECT COUNT(*) AS karyawan_aktif FROM karyawan WHERE status_akun = 'aktif'"
    );
    return parseInt(rows[0].karyawan_aktif);
  }

  async getTotalPemesanan({ start_date, end_date }) {
    const { rows } = await db.query(
      `SELECT COUNT(*) AS total_pemesanan
       FROM pemesanan
       WHERE tanggal_pesanan >= $1
         AND tanggal_pesanan <= $2`,
      [start_date, end_date]
    );
    return parseInt(rows[0].total_pemesanan);
  }
}

module.exports = new ReportRepository();
