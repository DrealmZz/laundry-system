const shiftRepository = require('../repositories/shift.repository');
const db = require('../../../shared/database/db');
const { SHIFT_NAMES } = require('../../../shared/constants');

class ShiftService {
  async getAllShifts({ tanggal, nama_shift, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const shifts = await shiftRepository.findAll({ tanggal, nama_shift, limit, offset });
    const total = await shiftRepository.count({ tanggal, nama_shift });

    for (let shift of shifts) {
      shift.karyawan = await shiftRepository.findKaryawanByShiftId(shift.id_shift);
    }

    return {
      items: shifts,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async getShiftById(id) {
    const shift = await shiftRepository.findById(id);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }
    shift.karyawan = await shiftRepository.findKaryawanByShiftId(id);
    return shift;
  }

  async createShift({ nama_shift, tanggal, jam_mulai, jam_selesai }) {
    const validShifts = Object.values(SHIFT_NAMES);
    if (!validShifts.includes(nama_shift)) {
      throw Object.assign(new Error('nama_shift harus pagi, siang, sore, atau malam.'), { statusCode: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    if (tanggal < today) {
      throw Object.assign(new Error('Tanggal tidak boleh di masa lalu.'), { statusCode: 400 });
    }

    if (!jam_mulai || !jam_selesai) {
      throw Object.assign(new Error('jam_mulai dan jam_selesai wajib diisi.'), { statusCode: 400 });
    }

    const existing = await shiftRepository.findByTanggalAndShift({ tanggal, nama_shift });
    if (existing) {
      throw Object.assign(new Error('Shift sudah ada untuk tanggal tersebut.'), { statusCode: 409 });
    }

    const shift = await shiftRepository.create({ nama_shift, tanggal, jam_mulai, jam_selesai });

    await this._auditLog(null, 'karyawan', 'SHIFT_CREATED', `Shift ${nama_shift} pada ${tanggal} berhasil dibuat`);

    return shift;
  }

  async updateShift(id, { jam_mulai, jam_selesai }) {
    const shift = await shiftRepository.findById(id);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }

    if (!jam_mulai || !jam_selesai) {
      throw Object.assign(new Error('jam_mulai dan jam_selesai wajib diisi.'), { statusCode: 400 });
    }

    const updated = await shiftRepository.update(id, { jam_mulai, jam_selesai });

    await this._auditLog(null, 'karyawan', 'SHIFT_UPDATED', `Shift ID ${id} berhasil diupdate`);

    return updated;
  }

  async deleteShift(id) {
    const shift = await shiftRepository.findById(id);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    if (shift.tanggal < today) {
      throw Object.assign(new Error('Tidak bisa menghapus shift yang sudah lewat.'), { statusCode: 400 });
    }

    await shiftRepository.delete(id);

    await this._auditLog(null, 'karyawan', 'SHIFT_DELETED', `Shift ID ${id} (${shift.nama_shift} pada ${shift.tanggal}) berhasil dihapus`);

    return true;
  }

  async getKaryawanByShift(shiftId) {
    const shift = await shiftRepository.findById(shiftId);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }

    const karyawan = await shiftRepository.findKaryawanByShiftId(shiftId);
    return { karyawan, total: karyawan.length };
  }

  async assignKaryawanToShift({ id_shift, id_karyawan }) {
    const shift = await shiftRepository.findById(id_shift);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }

    const { rows: karyawanRows } = await db.query(
      'SELECT id_karyawan, role FROM karyawan WHERE id_karyawan = $1',
      [id_karyawan]
    );
    if (karyawanRows.length === 0) {
      throw Object.assign(new Error('Karyawan tidak ditemukan.'), { statusCode: 404 });
    }

    const karyawan = karyawanRows[0];
    if (!['admin', 'kasir'].includes(karyawan.role)) {
      throw Object.assign(new Error('Hanya karyawan dengan role admin atau kasir yang bisa di-assign ke shift.'), { statusCode: 400 });
    }

    const isAssigned = await shiftRepository.isKaryawanAssigned({ id_shift, id_karyawan });
    if (isAssigned) {
      throw Object.assign(new Error('Karyawan sudah di-assign ke shift ini.'), { statusCode: 409 });
    }

    await shiftRepository.assignKaryawan({ id_shift, id_karyawan });

    await this._auditLog(null, 'karyawan', 'SHIFT_ASSIGNED', `Karyawan ID ${id_karyawan} berhasil di-assign ke shift ID ${id_shift}`);

    return true;
  }

  async unassignKaryawanFromShift({ id_shift, id_karyawan }) {
    const shift = await shiftRepository.findById(id_shift);
    if (!shift) {
      throw Object.assign(new Error('Shift tidak ditemukan.'), { statusCode: 404 });
    }

    const isAssigned = await shiftRepository.isKaryawanAssigned({ id_shift, id_karyawan });
    if (!isAssigned) {
      throw Object.assign(new Error('Karyawan tidak di-assign ke shift ini.'), { statusCode: 404 });
    }

    await shiftRepository.unassignKaryawan({ id_shift, id_karyawan });

    await this._auditLog(null, 'karyawan', 'SHIFT_UNASSIGNED', `Karyawan ID ${id_karyawan} berhasil di-unassign dari shift ID ${id_shift}`);

    return true;
  }

  async _auditLog(userId, userTable, action, message) {
    try {
      await db.query(
        `INSERT INTO audit_log (id_customer, id_karyawan, tipe_log, isi_pesan, aktivitas, status)
         VALUES ($1, $2, $3, $4, $5, 'berhasil')`,
        [
          userTable === 'customer' ? userId : null,
          userTable === 'karyawan' ? userId : null,
          action,
          message,
          action.toLowerCase().replace(/_/g, ' ')
        ]
      );
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }
}

module.exports = new ShiftService();
