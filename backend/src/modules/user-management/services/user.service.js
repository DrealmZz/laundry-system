const crypto = require('crypto');
const { hashPassword } = require('../../../shared/utils');
const { ROLES } = require('../../../shared/constants');
const customerRepository = require('../../auth/repositories/customer.repository');
const karyawanRepository = require('../../auth/repositories/karyawan.repository');
const ownerRepository = require('../../auth/repositories/owner.repository');
const db = require('../../../shared/database/db');

class UserService {
  async getCustomers({ limit, offset }) {
    const customers = await customerRepository.findAll({ limit, offset });
    const total = await customerRepository.count();
    return { users: customers, total };
  }

  async getKaryawan({ role, limit, offset }) {
    const karyawan = await karyawanRepository.findAll({ role, limit, offset });
    const total = await karyawanRepository.count(role);
    return { users: karyawan, total };
  }

  async getOwners({ limit, offset }) {
    const { rows } = await db.query(
      'SELECT id_owner, nama_lengkap, username, no_hp, email, hak_akses, created_at FROM owner ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit || 50, offset || 0]
    );
    const countResult = await db.query('SELECT COUNT(*) FROM owner');
    return { users: rows, total: parseInt(countResult.rows[0].count) };
  }

  async getUserById(table, id) {
    if (table === 'customer') {
      return customerRepository.findById(id);
    } else if (table === 'karyawan') {
      return karyawanRepository.findById(id);
    } else if (table === 'owner') {
      return ownerRepository.findById(id);
    }
    throw Object.assign(new Error('Tabel tidak valid.'), { statusCode: 400 });
  }

  async createCustomer({ nama_lengkap, username, no_hp, email, password, alamat }, creatorRole) {
    if (creatorRole === ROLES.KASIR || creatorRole === ROLES.ADMIN) {
      // kasir dan admin boleh buat customer
    } else {
      throw Object.assign(new Error('Anda tidak memiliki akses untuk membuat customer.'), { statusCode: 403 });
    }

    if (await customerRepository.usernameExists(username)) {
      throw Object.assign(new Error('Username sudah digunakan.'), { statusCode: 409 });
    }
    if (await customerRepository.emailExists(email)) {
      throw Object.assign(new Error('Email sudah terdaftar.'), { statusCode: 409 });
    }

    const hashed = await hashPassword(password);
    return customerRepository.create({ nama_lengkap, username, no_hp, email, password: hashed, alamat });
  }

  async createKaryawan({ nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat }, creatorRole) {
    if (creatorRole !== ROLES.ADMIN) {
      throw Object.assign(new Error('Hanya admin yang bisa membuat karyawan.'), { statusCode: 403 });
    }

    if (!['admin', 'kasir'].includes(role)) {
      throw Object.assign(new Error('Role karyawan harus admin atau kasir.'), { statusCode: 400 });
    }

    if (await karyawanRepository.usernameExists(username)) {
      throw Object.assign(new Error('Username sudah digunakan.'), { statusCode: 409 });
    }
    if (await karyawanRepository.emailExists(email)) {
      throw Object.assign(new Error('Email sudah terdaftar.'), { statusCode: 409 });
    }

    const hashed = await hashPassword(password);
    return karyawanRepository.create({ nama_lengkap, username, no_hp, email, password: hashed, role, hak_akses, alamat });
  }

  async updateUser(table, id, data) {
    if (table === 'customer') {
      return customerRepository.update(id, data);
    } else if (table === 'karyawan') {
      return karyawanRepository.update(id, data);
    }
    throw Object.assign(new Error('Tabel tidak valid.'), { statusCode: 400 });
  }

  async resetPassword(table, id) {
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashed = await hashPassword(tempPassword);

    if (table === 'customer') {
      await customerRepository.updatePassword(id, hashed);
    } else if (table === 'karyawan') {
      await karyawanRepository.updatePassword(id, hashed);
    } else if (table === 'owner') {
      await ownerRepository.updatePassword(id, hashed);
    } else {
      throw Object.assign(new Error('Tabel tidak valid.'), { statusCode: 400 });
    }

    return tempPassword;
  }

  async setStatus(table, id, status) {
    if (!['aktif', 'tidak aktif'].includes(status)) {
      throw Object.assign(new Error('Status harus aktif atau tidak aktif.'), { statusCode: 400 });
    }

    if (table === 'customer') {
      return customerRepository.setStatus(id, status);
    } else if (table === 'karyawan') {
      return karyawanRepository.setStatus(id, status);
    }
    throw Object.assign(new Error('Tabel tidak valid.'), { statusCode: 400 });
  }
}

module.exports = new UserService();
