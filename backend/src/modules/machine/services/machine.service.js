const machineRepository = require('../repositories/machine.repository');
const auditLogRepository = require('../../auth/repositories/audit-log.repository');

class MachineService {
  async getAll() {
    return machineRepository.findAll();
  }

  async getById(id) {
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }
    return machine;
  }

  async getAvailableByDateAndShift(tanggal, shift) {
    if (!tanggal || !shift) {
      throw Object.assign(new Error('tanggal dan shift wajib diisi.'), { statusCode: 400 });
    }
    return machineRepository.findAvailableByDateAndShift(tanggal, shift);
  }

  async getAllWithStatus() {
    const machines = await machineRepository.findAllWithCurrentBooking();
    return machines.map(m => {
      if (m.status_mesin === 'perbaikan') {
        return { ...m, status_display: 'perbaikan', timeLeft: null, customer_nama: null };
      }

      if (m.id_pemesanan && m.jam_mulai && m.booking_status !== 'menunggu konfirmasi') {
        const estimasi = parseInt(m.estimasi_waktu) || 0;
        const [h, min] = m.jam_mulai.split(':').map(Number);
        const now = new Date();
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min, 0);
        const endTime = new Date(startTime.getTime() + estimasi * 60000);
        const timeLeftMs = endTime.getTime() - now.getTime();
        const timeLeftMin = Math.max(0, Math.ceil(timeLeftMs / 60000));

        if (timeLeftMin > 0) {
          return {
            ...m,
            status_display: 'dipakai',
            timeLeft: `${timeLeftMin} Menit`,
            customer_nama: m.customer_nama,
          };
        }
      }

      return { ...m, status_display: 'tersedia', timeLeft: null, customer_nama: null };
    });
  }

  async createMachine({ kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }, user) {
    // Validasi input
    if (!kode_mesin || !tipe_mesin || !nama_mesin) {
      throw Object.assign(new Error('kode_mesin, tipe_mesin, dan nama_mesin wajib diisi.'), { statusCode: 400 });
    }

    // Validasi tipe_mesin
    if (!['pencucian', 'pengeringan'].includes(tipe_mesin)) {
      throw Object.assign(new Error('tipe_mesin harus pencucian atau pengeringan.'), { statusCode: 400 });
    }

    // Cek kode_mesin unik
    const existing = await machineRepository.findByKode(kode_mesin);
    if (existing) {
      throw Object.assign(new Error('Kode mesin sudah digunakan.'), { statusCode: 409 });
    }

    // Buat mesin baru
    const machine = await machineRepository.create({
      kode_mesin,
      tipe_mesin,
      nama_mesin,
      kapasitas_kg: kapasitas_kg || null,
      konsumsi_kwh: konsumsi_kwh || null,
      penggunaan_air_liter: penggunaan_air_liter || null
    });

    // Audit log
    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'MACHINE_CREATED',
      message: `Mesin "${nama_mesin}" (${tipe_mesin}, kode: ${kode_mesin}) berhasil ditambahkan oleh ${user?.nama_lengkap || 'admin'}`,
    });

    return machine;
  }

  async updateMachine(id, { tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }, user) {
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }

    if (tipe_mesin && !['pencucian', 'pengeringan'].includes(tipe_mesin)) {
      throw Object.assign(new Error('tipe_mesin harus pencucian atau pengeringan.'), { statusCode: 400 });
    }

    const updated = await machineRepository.update(id, {
      tipe_mesin: tipe_mesin || machine.tipe_mesin,
      nama_mesin: nama_mesin || machine.nama_mesin,
      kapasitas_kg: kapasitas_kg ?? machine.kapasitas_kg,
      konsumsi_kwh: konsumsi_kwh ?? machine.konsumsi_kwh,
      penggunaan_air_liter: penggunaan_air_liter ?? machine.penggunaan_air_liter,
    });

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'MACHINE_UPDATED',
      message: `Mesin "${machine.nama_mesin}" (ID: ${id}, kode: ${machine.kode_mesin}) berhasil diupdate oleh ${user?.nama_lengkap || 'admin'}`,
    });

    return updated;
  }

  async updateMachineStatus(id, status_mesin, user) {
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }

    if (!['tersedia', 'dipakai', 'perbaikan'].includes(status_mesin)) {
      throw Object.assign(new Error('status_mesin harus tersedia, dipakai, atau perbaikan.'), { statusCode: 400 });
    }

    const updated = await machineRepository.updateStatus(id, status_mesin);

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'MACHINE_STATUS_CHANGED',
      message: `Mesin "${machine.nama_mesin}" (ID: ${id}) status diubah: "${machine.status_mesin}" → "${status_mesin}" oleh ${user?.nama_lengkap || 'admin'}`,
    });

    return updated;
  }

  async deleteMachine(id, user) {
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }

    await machineRepository.delete(id);

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'MACHINE_DELETED',
      message: `Mesin "${machine.nama_mesin}" (ID: ${id}, kode: ${machine.kode_mesin}) berhasil dihapus oleh ${user?.nama_lengkap || 'admin'}`,
    });
  }
}

module.exports = new MachineService();
