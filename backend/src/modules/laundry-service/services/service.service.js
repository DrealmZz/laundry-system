const serviceRepository = require('../repositories/service.repository');
const auditLogRepository = require('../../auth/repositories/audit-log.repository');

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

  async createService({ nama_layanan, jenis_layanan, harga, estimasi_waktu }, user) {
    if (!nama_layanan || !jenis_layanan || !harga || !estimasi_waktu) {
      throw Object.assign(new Error('nama_layanan, jenis_layanan, harga, dan estimasi_waktu wajib diisi.'), { statusCode: 400 });
    }

    if (!['kiloan', 'koin'].includes(jenis_layanan)) {
      throw Object.assign(new Error('jenis_layanan harus kiloan atau koin.'), { statusCode: 400 });
    }

    const service = await serviceRepository.create({ nama_layanan, jenis_layanan, harga, estimasi_waktu });

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'SERVICE_CREATED',
      message: `Layanan "${nama_layanan}" (${jenis_layanan}) berhasil dibuat dengan harga Rp${harga} oleh ${user?.nama_lengkap || 'admin'}`,
    });

    return service;
  }

  async updateService(id, data, user) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan.'), { statusCode: 404 });
    }

    if (data.jenis_layanan && !['kiloan', 'koin'].includes(data.jenis_layanan)) {
      throw Object.assign(new Error('jenis_layanan harus kiloan atau koin.'), { statusCode: 400 });
    }

    const updated = await serviceRepository.update(id, {
      nama_layanan: data.nama_layanan || existing.nama_layanan,
      jenis_layanan: data.jenis_layanan || existing.jenis_layanan,
      harga: data.harga ?? existing.harga,
      estimasi_waktu: data.estimasi_waktu ?? existing.estimasi_waktu,
      status_layanan: data.status_layanan !== undefined ? data.status_layanan : existing.status_layanan,
    });

    const changes = [];
    if (data.nama_layanan && data.nama_layanan !== existing.nama_layanan) changes.push(`nama: "${existing.nama_layanan}" → "${data.nama_layanan}"`);
    if (data.harga !== undefined && data.harga !== existing.harga) changes.push(`harga: Rp${existing.harga} → Rp${data.harga}`);
    if (data.estimasi_waktu !== undefined && data.estimasi_waktu !== existing.estimasi_waktu) changes.push(`durasi: ${existing.estimasi_waktu} → ${data.estimasi_waktu} menit`);
    if (data.status_layanan !== undefined && data.status_layanan !== existing.status_layanan) changes.push(`status: ${existing.status_layanan ? 'aktif' : 'nonaktif'} → ${data.status_layanan ? 'aktif' : 'nonaktif'}`);

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'SERVICE_UPDATED',
      message: `Layanan "${existing.nama_layanan}" (ID: ${id}) diubah oleh ${user?.nama_lengkap || 'admin'}. ${changes.join(', ') || 'Tidak ada perubahan'}`,
    });

    return updated;
  }

  async deleteService(id, user) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan.'), { statusCode: 404 });
    }

    await serviceRepository.delete(id);

    await auditLogRepository.create({
      userId: user?.id || null,
      userTable: user?.table || 'karyawan',
      action: 'SERVICE_DELETED',
      message: `Layanan "${existing.nama_layanan}" (ID: ${id}, ${existing.jenis_layanan}) berhasil dihapus oleh ${user?.nama_lengkap || 'admin'}`,
    });
  }
}

module.exports = new ServiceService();
