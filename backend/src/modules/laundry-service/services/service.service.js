const serviceRepository = require('../repositories/service.repository');

class ServiceService {
  async getAllServices({ limit, offset }) {
    const services = await serviceRepository.findAll({ limit, offset });
    const total = await serviceRepository.count();
    return { services, total };
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw Object.assign(new Error('Layanan tidak ditemukan.'), { statusCode: 404 });
    }
    return service;
  }

  async createService({ nama_layanan, jenis_layanan, harga, estimasi_waktu }) {
    if (!nama_layanan || !jenis_layanan || !harga || !estimasi_waktu) {
      throw Object.assign(new Error('nama_layanan, jenis_layanan, harga, dan estimasi_waktu wajib diisi.'), { statusCode: 400 });
    }

    if (!['kiloan', 'koin'].includes(jenis_layanan)) {
      throw Object.assign(new Error('jenis_layanan harus kiloan atau koin.'), { statusCode: 400 });
    }

    return serviceRepository.create({ nama_layanan, jenis_layanan, harga, estimasi_waktu });
  }

  async updateService(id, data) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (data.jenis_layanan && !['kiloan', 'koin'].includes(data.jenis_layanan)) {
      throw Object.assign(new Error('jenis_layanan harus kiloan atau koin.'), { statusCode: 400 });
    }

    return serviceRepository.update(id, {
      nama_layanan: data.nama_layanan || existing.nama_layanan,
      jenis_layanan: data.jenis_layanan || existing.jenis_layanan,
      harga: data.harga || existing.harga,
      estimasi_waktu: data.estimasi_waktu || existing.estimasi_waktu,
    });
  }

  async deleteService(id) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan.'), { statusCode: 404 });
    }
    return serviceRepository.delete(id);
  }
}

module.exports = new ServiceService();
