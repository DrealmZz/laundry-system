const machineRepository = require('../repositories/machine.repository');

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
}

module.exports = new MachineService();
