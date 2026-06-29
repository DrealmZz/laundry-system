const crypto = require('crypto');
const db = require('../../../shared/database/db');
const transaksiRepository = require('../repositories/transaksi.repository');
const pemesananRepository = require('../../booking/repositories/pemesanan.repository');

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
}

module.exports = new TransaksiService();
