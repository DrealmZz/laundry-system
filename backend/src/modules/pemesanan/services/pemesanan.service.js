const crypto = require('crypto');
const { BOOKING_STATUS } = require('../../../shared/constants');
const db = require('../../../shared/database/db');
const pemesananRepository = require('../repositories/pemesanan.repository');
const transaksiRepository = require('../../transaction/repositories/transaksi.repository');
const notificationService = require('../../notification/services/notification.service');
const auditLogRepository = require('../../auth/repositories/audit-log.repository');

class PemesananService {
  _mapJamMulaiToShift(jamMulai) {
    const [h] = jamMulai.split(':').map(Number);
    if (h >= 6 && h < 12) return 'pagi';
    if (h >= 12 && h < 16) return 'siang';
    if (h >= 16 && h < 19) return 'sore';
    return 'malam';
  }

  async createPemesanan({ id_customer, id_layanan, mesin_ids, tanggal_pesanan, shift, jam_mulai, berat_kg, jenis_pencucian, metode_pengambilan, catatan }) {
    if (!id_layanan || !tanggal_pesanan || !jenis_pencucian || !metode_pengambilan) {
      throw Object.assign(new Error('id_layanan, tanggal_pesanan, jenis_pencucian, dan metode_pengambilan wajib diisi.'), { statusCode: 400 });
    }

    if (!['kiloan', 'koin'].includes(jenis_pencucian)) {
      throw Object.assign(new Error('jenis_pencucian harus kiloan atau koin.'), { statusCode: 400 });
    }

    if (!['ambil_sendiri', 'pengiriman'].includes(metode_pengambilan)) {
      throw Object.assign(new Error('metode_pengambilan harus ambil_sendiri atau pengiriman.'), { statusCode: 400 });
    }

    let shiftFinal = shift;
    let jamMulaiFinal = null;

    if (jenis_pencucian === 'koin') {
      if (!jam_mulai) {
        throw Object.assign(new Error('jam_mulai wajib diisi untuk pemesanan koin.'), { statusCode: 400 });
      }

      const jamRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!jamRegex.test(jam_mulai)) {
        throw Object.assign(new Error('Format jam_mulai harus HH:MM (contoh: 14:30).'), { statusCode: 400 });
      }

      const [h, m] = jam_mulai.split(':').map(Number);
      const now = new Date();
      const selectedDate = new Date(tanggal_pesanan + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00');
      const diffMs = selectedDate.getTime() - now.getTime();
      if (diffMs < 3600000) {
        throw Object.assign(new Error('Jam mulai harus minimal 1 jam dari sekarang.'), { statusCode: 400 });
      }

      jamMulaiFinal = jam_mulai;
      shiftFinal = this._mapJamMulaiToShift(jam_mulai);
    } else {
      if (!shift) {
        throw Object.assign(new Error('shift wajib diisi untuk pemesanan kiloan.'), { statusCode: 400 });
      }

      if (!['pagi', 'siang', 'sore', 'malam'].includes(shift)) {
        throw Object.assign(new Error('shift harus pagi, siang, sore, atau malam.'), { statusCode: 400 });
      }
    }

    return pemesananRepository.create({
      id_customer,
      id_layanan,
      mesin_ids,
      tanggal_pesanan,
      shift: shiftFinal,
      jam_mulai: jamMulaiFinal,
      status_pesanan: BOOKING_STATUS.MENUNGGU_KONFIRMASI,
      berat_kg,
      jenis_pencucian,
      metode_pengambilan,
      catatan,
    });

    // Note: audit log for booking creation is handled at controller level since we need the result id
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

  async updateStatus(id, newStatus, userRole, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    const currentStatus = pemesanan.status_pesanan;
    const validTransitions = this._getValidTransitions(currentStatus, pemesanan.jenis_pencucian, pemesanan.metode_pengambilan);

    if (!validTransitions.includes(newStatus)) {
      throw Object.assign(
        new Error(`Tidak bisa mengubah status dari '${currentStatus}' ke '${newStatus}'.`),
        { statusCode: 400 }
      );
    }

    const updated = await pemesananRepository.updateStatus(id, newStatus);

    await auditLogRepository.create({
      userId: user?.id || pemesanan.id_customer,
      userTable: user?.table || 'customer',
      action: 'BOOKING_STATUS_CHANGED',
      message: `Booking #${id} berubah status: "${currentStatus}" → "${newStatus}" oleh ${user?.nama_lengkap || userRole}`,
    });

    return updated;
  }

  async cancelPemesanan(id, catatan, userRole, userId, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    // Admin/kasir bisa batalkan kapan saja
    if (['admin', 'kasir'].includes(userRole)) {
      const result = await pemesananRepository.cancel(id, catatan, 'pesanan ditolak');
      await auditLogRepository.create({
        userId: user?.id || userId,
        userTable: user?.table || (userRole === 'customer' ? 'customer' : 'karyawan'),
        action: 'BOOKING_REJECTED',
        message: `Booking #${id} ditolak oleh ${user?.nama_lengkap || userRole}. Alasan: ${catatan || '-'}`,
      });
      return result;
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

      const result = await pemesananRepository.cancel(id, catatan, 'pesanan dibatalkan');
      await auditLogRepository.create({
        userId: user?.id || userId,
        userTable: user?.table || 'customer',
        action: 'BOOKING_CANCELLED',
        message: `Booking #${id} dibatalkan oleh ${user?.nama_lengkap || 'customer'}. Alasan: ${catatan || '-'}`,
      });
      return result;
    }

    throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
  }

  async confirmPickup(id, userRole, user) {
    if (!['kasir', 'admin'].includes(userRole)) {
      throw Object.assign(new Error('Hanya kasir/admin yang bisa konfirmasi jemput.'), { statusCode: 403 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak melalui proses penjemputan.'), { statusCode: 400 });
    }

    if (pemesanan.status_pesanan !== 'disetujui') {
      throw Object.assign(
        new Error(`Status harus 'disetujui' untuk konfirmasi jemput. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const result = await pemesananRepository.updateStatus(id, 'penjemputan');

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'BOOKING_PICKUP_CONFIRMED',
      message: `Booking #${id} dikonfirmasi penjemputan oleh ${user?.nama_lengkap || userRole}`,
    });

    return result;
  }

  async confirmClothesReceived(id, userRole, user) {
    if (!['kasir', 'admin'].includes(userRole)) {
      throw Object.assign(new Error('Hanya kasir/admin yang bisa konfirmasi pakaian diterima.'), { statusCode: 403 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak melalui proses konfirmasi pakaian.'), { statusCode: 400 });
    }

    if (pemesanan.status_pesanan !== 'penjemputan') {
      throw Object.assign(
        new Error(`Status harus 'penjemputan' untuk konfirmasi pakaian diterima. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const result2 = await pemesananRepository.updateStatus(id, 'penimbangan');

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'BOOKING_CLOTHES_RECEIVED',
      message: `Booking #${id} pakaian diterima, masuk penimbangan oleh ${user?.nama_lengkap || userRole}`,
    });

    return result2;
  }

  async weighAndNotify(id, berat_kg, userRole, user) {
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

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak melalui proses timbang manual.'), { statusCode: 400 });
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

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'BOOKING_WEIGHED',
      message: `Booking #${id} ditimbang: ${berat_kg} kg, status → menunggu pembayaran oleh ${user?.nama_lengkap || userRole}`,
    });

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

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak menggunakan jadwal pengiriman.'), { statusCode: 400 });
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

  async confirmPayment(id, userId, id_karyawan, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pembayaran koin dilakukan di outlet oleh kasir.'), { statusCode: 400 });
    }

    if (pemesanan.status_pesanan !== 'menunggu pembayaran') {
      throw Object.assign(
        new Error(`Status harus 'menunggu pembayaran' untuk konfirmasi pembayaran. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const alreadyPaid = await transaksiRepository.existsByPemesanan(id);
    if (alreadyPaid) {
      // Recovery: previous attempt created transaksi but failed to update status
      if (pemesanan.status_pesanan === 'menunggu pembayaran') {
        const updated = await pemesananRepository.updateStatus(id, 'sudah dibayar');
        return updated;
      }
      throw Object.assign(new Error('Pemesanan ini sudah lunas.'), { statusCode: 409 });
    }

    // Resolve id_karyawan: verifikasi ada di tabel karyawan, kalau tidak pakai kasir default
    let resolvedKaryawanId = null;
    if (id_karyawan) {
      const { rows: karyawanCheck } = await db.query(
        'SELECT id_karyawan FROM karyawan WHERE id_karyawan = $1',
        [id_karyawan]
      );
      if (karyawanCheck.length > 0) {
        resolvedKaryawanId = id_karyawan;
      }
    }
    if (!resolvedKaryawanId) {
      const { rows: kasirRows } = await db.query(
        "SELECT id_karyawan FROM karyawan WHERE role = 'kasir' AND status_akun = 'aktif' ORDER BY id_karyawan LIMIT 1"
      );
      resolvedKaryawanId = kasirRows[0]?.id_karyawan || null;
    }
    if (!resolvedKaryawanId) {
      throw Object.assign(new Error('Tidak ada kasir aktif yang tersedia untuk memproses pembayaran.'), { statusCode: 500 });
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

    await transaksiRepository.create({
      id_pemesanan: id,
      id_customer: pemesanan.id_customer,
      id_karyawan: resolvedKaryawanId,
      nomor_struk,
      total,
      metode_pembayaran: 'qris',
      status_pembayaran: 'lunas',
    });

    const result3 = await pemesananRepository.updateStatus(id, 'sudah dibayar');

    await auditLogRepository.create({
      userId: user?.id || userId,
      userTable: user?.table || 'customer',
      action: 'BOOKING_PAYMENT_CONFIRMED',
      message: `Booking #${id} pembayaran QRIS oleh ${user?.nama_lengkap || 'customer'}. Struk: ${nomor_struk}, total: Rp${total}`,
    });

    await notificationService.createNotification({
      id_pemesanan: id,
      id_customer: pemesanan.id_customer,
      judul: 'Pembayaran Diterima',
      isi_pesan: 'Pembayaran Anda telah diterima. Pesanan siap diproses.',
    }).catch(() => {});

    return result3;
  }

  async approveBooking(id, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'menunggu konfirmasi') {
      throw Object.assign(
        new Error(`Status harus 'menunggu konfirmasi' untuk disetujui. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const updated = await pemesananRepository.updateStatus(id, 'disetujui');

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: 'karyawan',
      action: 'BOOKING_STATUS_CHANGED',
      message: `Booking #${id} disetujui oleh admin ${user?.nama_lengkap || '-'}`,
    });

    const isKiloan = pemesanan.jenis_pencucian === 'kiloan';
    await notificationService.createNotification({
      id_pemesanan: id,
      id_customer: pemesanan.id_customer,
      judul: 'Pesanan Disetujui',
      isi_pesan: isKiloan
        ? 'Pesanan laundry Anda telah disetujui oleh admin. Menunggu konfirmasi kasir untuk penjemputan.'
        : 'Pemesanan mesin koin Anda telah disetujui. Silakan datang ke outlet untuk pembayaran.',
    }).catch(() => {});

    return updated;
  }

  async rejectBooking(id, catatan, user) {
    if (!catatan) {
      throw Object.assign(new Error('Alasan penolakan wajib diisi.'), { statusCode: 400 });
    }

    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.status_pesanan !== 'menunggu konfirmasi') {
      throw Object.assign(
        new Error(`Status harus 'menunggu konfirmasi' untuk ditolak. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const result = await pemesananRepository.cancel(id, catatan, 'pesanan ditolak');

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: 'karyawan',
      action: 'BOOKING_REJECTED',
      message: `Booking #${id} ditolak oleh admin ${user?.nama_lengkap || '-'}. Alasan: ${catatan}`,
    });

    await notificationService.createNotification({
      id_pemesanan: id,
      id_customer: pemesanan.id_customer,
      judul: 'Pesanan Ditolak',
      isi_pesan: `Pesanan laundry Anda ditolak oleh admin. Alasan: ${catatan}`,
    }).catch(() => {});

    return result;
  }

  async confirmReceived(id, userId, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.id_customer !== userId) {
      throw Object.assign(new Error('Anda tidak memiliki akses.'), { statusCode: 403 });
    }

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak melalui proses pengiriman.'), { statusCode: 400 });
    }

    if (pemesanan.status_pesanan !== 'pengiriman') {
      throw Object.assign(
        new Error(`Status harus 'pengiriman' untuk konfirmasi diterima. Status saat ini: '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const result4 = await pemesananRepository.updateStatus(id, 'selesai');

    await auditLogRepository.create({
      userId: user?.id || userId,
      userTable: user?.table || 'customer',
      action: 'BOOKING_COMPLETED',
      message: `Booking #${id} selesai, pakaian diterima oleh ${user?.nama_lengkap || 'customer'}`,
    });

    return result4;
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

  async updateMetodePengambilan(id, metode_pengambilan, user) {
    const pemesanan = await pemesananRepository.findById(id);
    if (!pemesanan) {
      throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (pemesanan.jenis_pencucian === 'koin') {
      throw Object.assign(new Error('Pemesanan koin tidak memiliki metode pengambilan (self-service di outlet).'), { statusCode: 400 });
    }

    if (!['ambil_sendiri', 'pengiriman'].includes(metode_pengambilan)) {
      throw Object.assign(new Error('metode_pengambilan harus ambil_sendiri atau pengiriman.'), { statusCode: 400 });
    }

    const nonEditableStatus = ['pengiriman', 'selesai', 'pesanan ditolak', 'pesanan dibatalkan'];
    if (nonEditableStatus.includes(pemesanan.status_pesanan)) {
      throw Object.assign(
        new Error(`Tidak bisa mengubah metode pengambilan pada status '${pemesanan.status_pesanan}'.`),
        { statusCode: 400 }
      );
    }

    const updated = await pemesananRepository.updateMetodePengambilan(id, metode_pengambilan);

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'BOOKING_STATUS_CHANGED',
      message: `Booking #${id} metode_pengambilan diubah ke "${metode_pengambilan}" oleh ${user?.nama_lengkap || 'kasir'}`,
    });

    return updated;
  }

  _getValidTransitions(currentStatus, jenisPencucian = 'kiloan', metodePengambilan = 'pengiriman') {
    if (jenisPencucian === 'koin') {
      const transitions = {
        'menunggu konfirmasi': ['pesanan ditolak', 'pesanan dibatalkan'],
        'disetujui': ['menunggu pembayaran', 'sudah dibayar', 'pesanan ditolak'],
        'menunggu pembayaran': ['sudah dibayar'],
        'sudah dibayar': ['selesai'],
        'selesai': [],
        'pesanan ditolak': [],
        'pesanan dibatalkan': [],
      };
      return transitions[currentStatus] || [];
    }

    const transitions = {
      'menunggu konfirmasi': ['pesanan ditolak', 'pesanan dibatalkan'],
      'disetujui': ['penjemputan', 'pesanan ditolak'],
      'penjemputan': ['penimbangan'],
      'penimbangan': ['menunggu pembayaran'],
      'menunggu pembayaran': ['sudah dibayar', 'pesanan ditolak'],
      'menunggu verifikasi pembayaran': ['sudah dibayar', 'pesanan ditolak'],
      'sudah dibayar': ['diproses'],
      'diproses': ['sedang di cuci'],
      'sedang di cuci': ['sedang di keringkan'],
      'sedang di keringkan': ['sedang di setrika', 'pencucian selesai'],
      'sedang di setrika': ['pencucian selesai'],
      'pengiriman': ['selesai'],
      'selesai': [],
      'pesanan ditolak': [],
      'pesanan dibatalkan': [],
    };

    // Ambil_sendiri: langsung selesai setelah cucian siap
    if (metodePengambilan === 'ambil_sendiri') {
      transitions['pencucian selesai'] = ['selesai'];
    } else {
      transitions['pencucian selesai'] = ['pengiriman'];
    }

    return transitions[currentStatus] || [];
  }
}

module.exports = new PemesananService();
