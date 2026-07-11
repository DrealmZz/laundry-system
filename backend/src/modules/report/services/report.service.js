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

  // ── Shift Performance ──
  async getShiftPerformance({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }

    const rows = await reportRepository.getShiftPerformance({ start_date, end_date });
    const byShift = {};
    rows.forEach(r => {
      const totalTx = parseInt(r.total_transaksi) || 0;
      const totalRev = parseFloat(r.total_revenue) || 0;
      byShift[r.shift] = {
        shift: r.shift,
        total_transaksi: totalTx,
        total_revenue: totalRev,
        total_kg: Math.round((parseFloat(r.total_kg) || 0) * 10) / 10,
        total_koin: parseInt(r.total_koin) || 0,
        rata_rata_per_transaksi: totalTx > 0 ? Math.round(totalRev / totalTx) : 0,
      };
    });

    const shifts = ['pagi', 'siang', 'sore', 'malam'].map(s => byShift[s] || {
      shift: s,
      total_transaksi: 0,
      total_revenue: 0,
      total_kg: 0,
      total_koin: 0,
      rata_rata_per_transaksi: 0,
    });

    return { periode: { start_date, end_date }, shifts };
  }

  // ── Profit & Loss (data biaya asli) ──
  async getProfitLoss({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }

    const summary = await reportRepository.getRevenueSummary({ start_date, end_date });
    const costSummary = await reportRepository.getOperationalCostSummary({ start_date, end_date });
    const totalKg = await reportRepository.getTotalWeight({ start_date, end_date });

    const totalRevenue = parseFloat(summary.total_revenue) || 0;
    const totalCost = costSummary.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
    const netProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      periode: { start_date, end_date },
      total_revenue: totalRevenue,
      total_cost: totalCost,
      net_profit: netProfit,
      margin_percent: Math.round(margin * 100) / 100,
      cost_per_kg: totalKg > 0 ? Math.round(totalCost / totalKg) : 0,
      total_kg: totalKg,
      per_kategori: costSummary.map(row => ({
        kategori: row.kategori,
        total: parseFloat(row.total),
        persen: totalCost > 0 ? Math.round((parseFloat(row.total) / totalCost) * 1000) / 10 : 0,
      })),
    };
  }

  // ── Operational Costs CRUD ──
  async getOperationalCosts({ start_date, end_date }) {
    if (!start_date || !end_date) {
      throw Object.assign(new Error('start_date dan end_date wajib diisi.'), { statusCode: 400 });
    }
    const rows = await reportRepository.getOperationalCosts({ start_date, end_date });
    return rows.map(r => ({
      id: r.id,
      tanggal: r.tanggal,
      kategori: r.kategori,
      jumlah: parseFloat(r.jumlah),
      satuan: r.satuan,
      deskripsi: r.deskripsi,
    }));
  }

  async createOperationalCost({ tanggal, kategori, jumlah, deskripsi }) {
    const allowedKategori = ['deterjen', 'listrik', 'air', 'gaji', 'sewa', 'perawatan', 'lainnya'];
    if (!kategori || !allowedKategori.includes(kategori)) {
      throw Object.assign(new Error(`Kategori tidak valid. Pilihan: ${allowedKategori.join(', ')}.`), { statusCode: 400 });
    }
    const amount = parseFloat(jumlah);
    if (isNaN(amount) || amount <= 0) {
      throw Object.assign(new Error('Jumlah biaya harus lebih besar dari 0.'), { statusCode: 400 });
    }
    const created = await reportRepository.createOperationalCost({
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      kategori,
      jumlah: amount,
      deskripsi: deskripsi || null,
    });
    return {
      id: created.id,
      tanggal: created.tanggal,
      kategori: created.kategori,
      jumlah: parseFloat(created.jumlah),
      satuan: created.satuan,
      deskripsi: created.deskripsi,
    };
  }

  async deleteOperationalCost(id) {
    const deleted = await reportRepository.deleteOperationalCost(id);
    if (!deleted) {
      throw Object.assign(new Error('Biaya operasional tidak ditemukan.'), { statusCode: 404 });
    }
    return deleted;
  }

  // ── Sales Target ──
  async getSalesTarget(periode) {
    if (!periode) {
      throw Object.assign(new Error('periode (YYYY-MM) wajib diisi.'), { statusCode: 400 });
    }
    const target = await reportRepository.getSalesTarget(periode);
    return {
      periode,
      target_amount: target ? parseFloat(target.target_amount) : 0,
    };
  }

  async setSalesTarget({ periode, target_amount, id_owner }) {
    if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
      throw Object.assign(new Error('periode harus format YYYY-MM.'), { statusCode: 400 });
    }
    const amount = parseFloat(target_amount);
    if (isNaN(amount) || amount < 0) {
      throw Object.assign(new Error('target_amount tidak valid.'), { statusCode: 400 });
    }
    const saved = await reportRepository.upsertSalesTarget({ periode, target_amount: amount, id_owner });
    return {
      periode: saved.periode,
      target_amount: parseFloat(saved.target_amount),
    };
  }
}

module.exports = new ReportService();
