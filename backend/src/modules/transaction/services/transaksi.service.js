const crypto = require('crypto');
const db = require('../../../shared/database/db');
const transaksiRepository = require('../repositories/transaksi.repository');
const pemesananRepository = require('../../pemesanan/repositories/pemesanan.repository');
const auditLogRepository = require('../../auth/repositories/audit-log.repository');

class TransaksiService {
  async createTransaksi({ id_pemesanan, id_karyawan, metode_pembayaran }) {
    if (!id_pemesanan || !metode_pembayaran) {
      throw Object.assign(new Error('id_pemesanan dan metode_pembayaran wajib diisi.'), { statusCode: 400 });
    }

    if (!['cash', 'transfer', 'qris', 'koin'].includes(metode_pembayaran)) {
      throw Object.assign(new Error('metode_pembayaran harus cash, transfer, qris, atau koin.'), { statusCode: 400 });
    }

    const pemesanan = await pemesananRepository.findById(id_pemesanan);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'menunggu pembayaran') {
      throw Object.assign(
        new Error(`Pemesanan dengan status '${pemesanan.status_pesanan}' belum bisa dibayar. Status harus 'menunggu pembayaran'.`),
        { statusCode: 400 }
      );
    }

    const alreadyPaid = await transaksiRepository.existsByPemesanan(id_pemesanan);
    if (alreadyPaid) {
      throw Object.assign(new Error('Pemesanan ini sudah lunas.'), { statusCode: 409 });
    }

    let total;
    if (pemesanan.jenis_pencucian === 'kiloan' && pemesanan.berat_kg) {
      total = parseFloat(pemesanan.harga) * parseFloat(pemesanan.berat_kg);
    } else {
      total = parseFloat(pemesanan.harga);
    }

    const tanggal = new Date();
    const dateStr = tanggal.getFullYear().toString() +
      (tanggal.getMonth() + 1).toString().padStart(2, '0') +
      tanggal.getDate().toString().padStart(2, '0');
    const randomNum = crypto.randomInt(1000, 9999);
    const nomor_struk = `STRUK-${dateStr}-${randomNum}`;

    const transaksi = await transaksiRepository.create({
      id_pemesanan,
      id_customer: pemesanan.id_customer,
      id_karyawan,
      nomor_struk,
      total,
      metode_pembayaran,
      status_pembayaran: 'lunas',
    });

    await pemesananRepository.updateStatus(id_pemesanan, 'sudah dibayar');

    return transaksi;
  }

  async getAllTransaksi({ id_customer, status_pembayaran, start_date, end_date, limit, offset }) {
    const transaksi = await transaksiRepository.findAll({ id_customer, status_pembayaran, start_date, end_date, limit, offset });
    const total = await transaksiRepository.count({ id_customer, status_pembayaran, start_date, end_date });
    return { transaksi, total };
  }

  async getTransaksiById(id) {
    const transaksi = await transaksiRepository.findById(id);
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
    }
    return transaksi;
  }

  async getTransaksiByStruk(nomor_struk) {
    const transaksi = await transaksiRepository.findByStruk(nomor_struk);
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi dengan nomor struk tersebut tidak ditemukan.'), { statusCode: 404 });
    }
    return transaksi;
  }

  async confirmPayment(id, metode_pembayaran) {
    // Cek transaksi ada
    const transaksi = await transaksiRepository.findById(id);
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
    }

    // Cek status pembayaran
    if (transaksi.status_pembayaran === 'lunas') {
      throw Object.assign(new Error('Transaksi sudah lunas.'), { statusCode: 400 });
    }

    // Validasi metode pembayaran
    if (!['cash', 'transfer', 'qris', 'koin'].includes(metode_pembayaran)) {
      throw Object.assign(new Error('metode_pembayaran harus cash, transfer, qris, atau koin.'), { statusCode: 400 });
    }

    // Update status pembayaran
    const updated = await transaksiRepository.updatePaymentStatus(id, metode_pembayaran);

    // Update status pemesanan
    await pemesananRepository.updateStatus(transaksi.id_pemesanan, 'sudah dibayar');

    // Audit log
    await auditLogRepository.create({
      userId: null,
      userTable: 'karyawan',
      action: 'PAYMENT_CONFIRMED'
    });

    return updated;
  }

  async getDailyRecap({ tanggal, id_karyawan, shift }) {
    // Validasi input
    if (!tanggal) {
      throw Object.assign(new Error('tanggal wajib diisi.'), { statusCode: 400 });
    }

    // Ambil rekap
    const recap = await transaksiRepository.getDailyRecap({ tanggal, id_karyawan, shift });
    const byPaymentMethod = await transaksiRepository.getDailyRecapByPaymentMethod({ tanggal, id_karyawan });
    const details = await transaksiRepository.getDailyRecapDetails({ tanggal, id_karyawan, shift });

    return {
      tanggal,
      shift: shift || 'semua',
      total_transaksi: parseInt(recap.total_transaksi),
      total_pendapatan: parseFloat(recap.total_pendapatan) || 0,
      transaksi_lunas: parseInt(recap.transaksi_lunas),
      transaksi_belum_lunas: parseInt(recap.transaksi_belum_lunas),
      metode_pembayaran: byPaymentMethod.reduce((acc, row) => {
        acc[row.metode_pembayaran] = parseInt(row.jumlah);
        return acc;
      }, {}),
      transaksi: details
    };
  }

  async generatePDF(id) {
    // Ambil detail transaksi
    const transaksi = await transaksiRepository.findByIdWithDetails(id);
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
    }

    // Buat PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A5', margin: 30 });

    // Header
    doc.fontSize(16).text('LAUNDRY SYSTEM', { align: 'center' });
    doc.fontSize(10).text('Struk Digital', { align: 'center' });
    doc.moveDown();

    // Garis pemisah
    doc.moveTo(30, doc.y).lineTo(250, doc.y).stroke();
    doc.moveDown();

    // Info struk
    doc.fontSize(10);
    doc.text(`No. Struk: ${transaksi.nomor_struk}`);
    doc.text(`Tanggal: ${new Date(transaksi.tanggal_transaksi).toLocaleDateString('id-ID')}`);
    doc.text(`Kasir: ${transaksi.nama_karyawan}`);
    doc.moveDown();

    // Info customer
    doc.text(`Customer: ${transaksi.nama_customer}`);
    doc.text(`Layanan: ${transaksi.nama_layanan}`);
    doc.text(`Jenis: ${transaksi.jenis_layanan}`);
    if (transaksi.berat_kg) {
      doc.text(`Berat: ${transaksi.berat_kg} kg`);
      doc.text(`Harga/kg: Rp ${parseFloat(transaksi.harga).toLocaleString()}`);
    }
    doc.moveDown();

    // Garis pemisah
    doc.moveTo(30, doc.y).lineTo(250, doc.y).stroke();
    doc.moveDown();

    // Total
    doc.fontSize(12).text(`TOTAL: Rp ${parseFloat(transaksi.total).toLocaleString()}`, { align: 'right' });
    doc.fontSize(10).text(`Metode: ${transaksi.metode_pembayaran}`, { align: 'right' });
    doc.text(`Status: ${transaksi.status_pembayaran.toUpperCase()}`, { align: 'right' });
    doc.moveDown();

    // Footer
    doc.fontSize(8).text('Terima kasih atas kunjungan Anda!', { align: 'center' });

    return doc;
  }

  async generateQR(id) {
    // Ambil detail transaksi
    const transaksi = await transaksiRepository.findByIdWithDetails(id);
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan.'), { statusCode: 404 });
    }

    // Generate QR data dengan format QRIS standard
    // Format: laundaja:{id_transaksi}:{total}:{timestamp}
    const timestamp = Date.now();
    const qrisData = `laundaja:${id}:${transaksi.total}:${timestamp}`;

    return {
      qris_data: qrisData,
      total: parseFloat(transaksi.total),
      id_transaksi: id,
      nomor_struk: transaksi.nomor_struk
    };
  }
}

module.exports = new TransaksiService();
