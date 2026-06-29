const { BOOKING_STATUS } = require('../../../shared/constants');
const pemesananRepository = require('../repositories/pemesanan.repository');

class PemesananService {
  async createPemesanan({ id_customer, id_layanan, id_mesin, tanggal_pesanan, shift, berat_kg, jenis_pencucian, metode_pengambilan, catatan }) {
    if (!id_layanan || !tanggal_pesanan || !shift || !jenis_pencucian || !metode_pengambilan) {
      throw Object.assign(new Error('id_layanan, tanggal_pesanan, shift, jenis_pencucian, dan metode_pengambilan wajib diisi.'), { statusCode: 400 });
    }

    if (!['pagi', 'siang', 'sore', 'malam'].includes(shift)) {
      throw Object.assign(new Error('shift harus pagi, siang, sore, atau malam.'), { statusCode: 400 });
    }

    if (!['kiloan', 'koin'].includes(jenis_pencucian)) {
      throw Object.assign(new Error('jenis_pencucian harus kiloan atau koin.'), { statusCode: 400 });
    }

    if (!['ambil_sendiri', 'pengiriman'].includes(metode_pengambilan)) {
      throw Object.assign(new Error('metode_pengambilan harus ambil_sendiri atau pengiriman.'), { statusCode: 400 });
    }

    return pemesananRepository.create({
      id_customer,
      id_layanan,
      id_mesin,
      tanggal_pesanan,
      shift,
      status_pesanan: BOOKING_STATUS.MENUNGGU_KONFIRMASI,
      berat_kg,
      jenis_pencucian,
      metode_pengambilan,
      catatan,
    });
  }

  async getAllPemesanan({ id_customer, status_pesanan, limit, offset }) {
    const pemesanan = await pemesananRepository.findAll({ id_customer, status_pesanan, limit, offset });
    const total = await pemesananRepository.count({ id_customer, status_pesanan });
    return { pemesanan, total };
  }

  async getPemesananById(id) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }
    return pemesanan;
  }

  async updateStatus(id, newStatus, userRole) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    const currentStatus = pemesanan.status_pesanan;
    const validTransitions = this._getValidTransitions(currentStatus, userRole);

    if (!validTransitions.includes(newStatus)) {
      throw Object.assign(
        new Error(`Tidak bisa mengubah status dari '${currentStatus}' ke '${newStatus}'.`),
        { statusCode: 400 }
      );
    }

    return pemesananRepository.updateStatus(id, newStatus);
  }

  async cancelPemesanan(id, catatan, userRole) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (!['admin', 'kasir'].includes(userRole)) {
      throw Object.assign(new Error('Hanya admin atau kasir yang bisa membatalkan pemesanan.'), { statusCode: 403 });
    }

    return pemesananRepository.cancel(id, catatan);
  }

  _getValidTransitions(currentStatus, role) {
    const transitions = {
      'menunggu konfirmasi': ['diproses', 'pesanan ditolak'],
      'diproses': ['sedang di cuci', 'pesanan ditolak'],
      'sedang di cuci': ['sedang di keringkan', 'pesanan ditolak'],
      'sedang di keringkan': ['sedang di setrika', 'pesanan ditolak'],
      'sedang di setrika': ['pencucian selesai', 'pesanan ditolak'],
      'pencucian selesai': ['menunggu pembayaran', 'pesanan ditolak'],
      'menunggu pembayaran': ['sudah dibayar', 'pesanan ditolak'],
      'sudah dibayar': ['selesai'],
      'selesai': [],
      'pesanan ditolak': [],
    };

    return transitions[currentStatus] || [];
  }
}

module.exports = new PemesananService();
