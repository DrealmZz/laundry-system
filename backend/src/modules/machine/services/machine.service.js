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

  async createMachine({ kode_mesin, tipe_mesin, nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
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
      userId: null,
      userTable: 'karyawan',
      action: 'MACHINE_CREATED'
    });

    return machine;
  }

  async updateMachine(id, { nama_mesin, kapasitas_kg, konsumsi_kwh, penggunaan_air_liter }) {
    // Cek mesin ada
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }

    // Update mesin
    const updated = await machineRepository.update(id, {
      nama_mesin: nama_mesin || machine.nama_mesin,
      kapasitas_kg: kapasitas_kg !== undefined ? kapasitas_kg : machine.kapasitas_kg,
      konsumsi_kwh: konsumsi_kwh !== undefined ? konsumsi_kwh : machine.konsumsi_kwh,
      penggunaan_air_liter: penggunaan_air_liter !== undefined ? penggunaan_air_liter : machine.penggunaan_air_liter
    });

    // Audit log
    await auditLogRepository.create({
      userId: null,
      userTable: 'karyawan',
      action: 'MACHINE_UPDATED'
    });

    return updated;
  }

  async updateMachineStatus(id, status_mesin) {
    // Cek mesin ada
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw Object.assign(new Error('Mesin tidak ditemukan.'), { statusCode: 404 });
    }

    // Validasi status
    if (!['tersedia', 'dipakai', 'perbaikan'].includes(status_mesin)) {
      throw Object.assign(new Error('status_mesin harus tersedia, dipakai, atau perbaikan.'), { statusCode: 400 });
    }

    // Update status
    const updated = await machineRepository.updateStatus(id, status_mesin);

    // Audit log
    await auditLogRepository.create({
      userId: null,
      userTable: 'karyawan',
      action: 'MACHINE_STATUS_CHANGED'
    });

    return updated;
  }
}

module.exports = new MachineService();
