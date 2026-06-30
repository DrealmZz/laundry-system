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
         AND tanggal_transaksi <= $2`,
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
         AND tanggal_transaksi <= $2
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
         AND tanggal_transaksi <= $2
       GROUP BY DATE(tanggal_transaksi)
       ORDER BY tanggal`,
      [start_date, end_date]
    );
    return rows;
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
