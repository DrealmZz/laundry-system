const reportRepository = require('../repositories/report.repository');

class ReportService {
  async getFinanceReport({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }

    const summary = await reportRepository.getRevenueSummary({ start_date, end_date });
    const byPaymentMethod = await reportRepository.getRevenueByPaymentMethod({ start_date, end_date });
    const daily = await reportRepository.getDailyRevenue({ start_date, end_date });

    return {
      periode: { start_date, end_date },
      ringkasan: {
        total_transaksi: parseInt(summary.total_transaksi),
        total_revenue: parseFloat(summary.total_revenue),
        rata_rata_per_transaksi: parseFloat(summary.rata_rata_per_transaksi),
      },
      per_metode_pembayaran: byPaymentMethod.map(row => ({
        metode: row.metode_pembayaran,
        jumlah: parseInt(row.jumlah),
        total: parseFloat(row.total),
      })),
      per_hari: daily.map(row => ({
        tanggal: row.tanggal,
        jumlah_transaksi: parseInt(row.jumlah_transaksi),
        total_revenue: parseFloat(row.total_revenue),
      })),
    };
  }

  async getSummary({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }

    const totalPemesanan = await reportRepository.getTotalPemesanan({ start_date, end_date });
    const pemesananByStatus = await reportRepository.getPemesananByStatus({ start_date, end_date });
    const newCustomers = await reportRepository.getNewCustomers({ start_date, end_date });
    const activeKaryawan = await reportRepository.getActiveKaryawan();
    const revenueSummary = await reportRepository.getRevenueSummary({ start_date, end_date });

    return {
      periode: { start_date, end_date },
      pemesanan: {
        total: totalPemesanan,
        per_status: pemesananByStatus.map(row => ({
          status: row.status_pesanan,
          jumlah: parseInt(row.jumlah),
        })),
      },
      transaksi: {
        total_lunas: parseInt(revenueSummary.total_transaksi),
        total_revenue: parseFloat(revenueSummary.total_revenue),
      },
      pengguna: {
        customer_baru: newCustomers,
        karyawan_aktif: activeKaryawan,
      },
    };
  }

  async getDailyReport({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }

    const daily = await reportRepository.getDailyRevenue({ start_date, end_date });

    return {
      periode: { start_date, end_date },
      data: daily.map(row => ({
        tanggal: row.tanggal,
        jumlah_transaksi: parseInt(row.jumlah_transaksi),
        total_revenue: parseFloat(row.total_revenue),
      })),
    };
  }
}

module.exports = new ReportService();
