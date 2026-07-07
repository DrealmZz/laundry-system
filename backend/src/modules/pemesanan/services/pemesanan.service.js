const { BOOKING_STATUS } = require('../../../shared/constants');
const pemesananRepository = require('../repositories/pemesanan.repository');
const notificationService = require('../../notification/services/notification.service');

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
    const validTransitions = this._getValidTransitions(currentStatus);

    if (!validTransitions.includes(newStatus)) {
      throw Object.assign(
        new Error(`Tidak bisa mengubah status dari '${currentStatus}' ke '${newStatus}'.`),
        { statusCode: 400 }
      );
    }

    const updated = await pemesananRepository.updateStatus(id, newStatus);

    // Kirim notifikasi ke customer saat admin approve
    if (newStatus === 'disetujui') {
      await notificationService.createNotification({
        id_pemesanan: id,
        id_customer: pemesanan.id_customer,
        judul: 'Pesanan Disetujui',
        isi_pesan: 'Pesanan laundry Anda telah disetujui. Menunggu konfirmasi kasir untuk penjemputan.',
      }).catch(() => {});
    }

    return updated;
  }

  async cancelPemesanan(id, catatan, userRole, userId) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    // Admin/kasir bisa batalkan kapan saja
    if (['admin', 'kasir'].includes(userRole)) {
      return pemesananRepository.cancel(id, catatan, 'pesanan ditolak');
    }

    // Customer hanya bisa batalkan pesanan miliknya dengan status tertentu
    if (userRole === 'customer') {
      if (pemesanan.id_customer !== userId) {
        throw Object.assign(new Error('Anda tidak memiliki akses untuk membatalkan pesanan ini.'), { statusCode: 403 });
      }

      const allowedStatuses = ['menunggu konfirmasi', 'disetujui'];
      if (!allowedStatuses.includes(pemesanan.status_pesanan)) {
        throw Object.assign(
          new Error(`Tidak bisa membatalkan pesanan dengan status '${pemesanan.status_pesanan}'.`),
          { statusCode: 400 }
        );
      }

      return pemesananRepository.cancel(id, catatan, 'pesanan dibatalkan');
    }

    throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
  }

  async confirmPickup(id, userRole) {
    if (!['kasir', 'admin'].includes(userRole)) {
      throw Object.assign(new Error('Hanya kasir/admin yang bisa konfirmasi jemput.'), { statusCode: 403 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'disetujui') {
      throw Object.assign(
        new Error(`Status harus 'disetujui' untuk konfirmasi jemput. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    return pemesananRepository.updateStatus(id, 'penjemputan');
  }

  async confirmClothesReceived(id, userRole) {
    if (!['kasir', 'admin'].includes(userRole)) {
      throw Object.assign(new Error('Hanya kasir/admin yang bisa konfirmasi pakaian diterima.'), { statusCode: 403 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'penjemputan') {
      throw Object.assign(
        new Error(`Status harus 'penjemputan' untuk konfirmasi pakaian diterima. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    return pemesananRepository.updateStatus(id, 'penimbangan');
  }

  async weighAndNotify(id, berat_kg, userRole) {
    if (!['kasir', 'admin'].includes(userRole)) {
      throw Object.assign(new Error('Hanya kasir/admin yang bisa input berat.'), { statusCode: 403 });
    }

    if (!berat_kg || berat_kg <= 0) {
      throw Object.assign(new Error('Berat harus lebih dari 0 kg.'), { statusCode: 400 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'penimbangan') {
      throw Object.assign(
        new Error(`Status harus 'penimbangan' untuk input berat. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    // Update berat + status
    await pemesananRepository.updateWeight(id, berat_kg);
    const updated = await pemesananRepository.updateStatus(id, 'menunggu pembayaran');

    // Kirim notif ke customer
    await notificationService.createNotification({
      id_pemesanan: id,
      id_customer: pemesanan.id_customer,
      judul: 'Pesanan Menunggu Pembayaran',
      isi_pesan: `Pakaian Anda sudah diterima dengan berat ${berat_kg} kg. Silakan lakukan pembayaran.`,
    }).catch(() => {});

    return updated;
  }

  async setDeliverySchedule(id, { tanggal_pengiriman, shift_pengiriman }, userId) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    if (pemesanan.status_pesanan !== 'pencucian selesai') {
      throw Object.assign(
        new Error(`Status harus 'pencucian selesai' untuk pilih jadwal. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    if (pemesanan.metode_pengambilan !== 'pengiriman') {
      throw Object.assign(new Error('Hanya pesanan dengan metode pengiriman yang bisa pilih jadwal.'), { statusCode: 400 });
    }

    if (!tanggal_pengiriman || !shift_pengiriman) {
      throw Object.assign(new Error('Tanggal dan shift pengiriman wajib diisi.'), { statusCode: 400 });
    }

    if (!['pagi', 'siang', 'sore', 'malam'].includes(shift_pengiriman)) {
      throw Object.assign(new Error('shift_pengiriman harus pagi, siang, sore, atau malam.'), { statusCode: 400 });
    }

    return pemesananRepository.updateDeliverySchedule(id, { tanggal_pengiriman, shift_pengiriman });
  }

  async confirmPayment(id, userId) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    if (pemesanan.status_pesanan !== 'menunggu pembayaran') {
      throw Object.assign(
        new Error(`Status harus 'menunggu pembayaran' untuk konfirmasi pembayaran. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    return pemesananRepository.updateStatus(id, 'sudah dibayar');
  }

  async confirmReceived(id, userId) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    if (pemesanan.status_pesanan !== 'pengiriman') {
      throw Object.assign(
        new Error(`Status harus 'pengiriman' untuk konfirmasi diterima. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    return pemesananRepository.updateStatus(id, 'selesai');
  }

  async generateQR(id, userId) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    const total = parseFloat(pemesanan.berat_kg || 0) * parseFloat(pemesanan.harga || 0);
    const timestamp = Date.now();
    const qrisData = `laundaja:${id}:${total}:${timestamp}`;

    return {
      qris_data: qrisData,
      total,
      id_pemesanan: id,
      service: pemesanan.nama_layanan,
      date: pemesanan.tanggal_pesanan,
    };
  }

  _getValidTransitions(currentStatus) {
    const transitions = {
      'menunggu konfirmasi': ['disetujui', 'pesanan ditolak', 'pesanan dibatalkan'],
      'disetujui': ['penjemputan', 'pesanan ditolak'],
      'penjemputan': ['penimbangan'],
      'penimbangan': ['menunggu pembayaran'],
      'menunggu pembayaran': ['sudah dibayar'],
      'sudah dibayar': ['diproses'],
      'diproses': ['sedang di cuci'],
      'sedang di cuci': ['sedang di keringkan'],
      'sedang di keringkan': ['sedang di setrika', 'pencucian selesai'],
      'sedang di setrika': ['pencucian selesai'],
      'pencucian selesai': ['pengiriman'],
      'pengiriman': ['selesai'],
      'selesai': [],
      'pesanan ditolak': [],
      'pesanan dibatalkan': [],
    };

    return transitions[currentStatus] || [];
  }
}

module.exports = new PemesananService();
