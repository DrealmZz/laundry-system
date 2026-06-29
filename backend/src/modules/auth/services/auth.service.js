const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../../../shared/utils');
const { ROLES, USER_TABLES } = require('../../../shared/constants');
const customerRepository = require('../repositories/customer.repository');
const karyawanRepository = require('../repositories/karyawan.repository');
const ownerRepository = require('../repositories/owner.repository');
const auditLogRepository = require('../repositories/audit-log.repository');

const MAX_FAILED_ATTEMPTS = 5;

class AuthService {
  async login({ identifier, password }) {
    let user = null;
    let table = null;
    let userIdField = null;
    let role = null;

    const customer = await customerRepository.findByLogin(identifier);
    if (customer) {
      user = customer;
      table = USER_TABLES.CUSTOMER;
      userIdField = 'id_customer';
      role = ROLES.CUSTOMER;
    }

    if (!user) {
      const karyawan = await karyawanRepository.findByLogin(identifier);
      if (karyawan) {
        user = karyawan;
        table = USER_TABLES.KARYAWAN;
        userIdField = 'id_karyawan';
        role = karyawan.role;
      }
    }

    if (!user) {
      const ownerUser = await ownerRepository.findByLogin(identifier);
      if (ownerUser) {
        user = ownerUser;
        table = USER_TABLES.OWNER;
        userIdField = 'id_owner';
        role = ROLES.OWNER;
      }
    }

    if (!user) {
      throw Object.assign(new Error('Username/email/no_hp atau password salah.'), { statusCode: 401 });
    }

    if (user.status_akun && user.status_akun !== 'aktif') {
      throw Object.assign(new Error('Akun Anda telah dinonaktifkan. Silakan hubungi admin.'), { statusCode: 403 });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      await auditLogRepository.create({
        userId: user[userIdField],
        userTable: table,
        action: 'LOGIN_FAILED',
      });

      throw Object.assign(new Error('Username/email/no_hp atau password salah.'), { statusCode: 401 });
    }

    await auditLogRepository.create({
      userId: user[userIdField],
      userTable: table,
      action: 'LOGIN_SUCCESS',
    });

    const token = jwt.sign(
      { id: user[userIdField], role, table },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const { password: _, ...userData } = user;

    return {
      token,
      user: {
        id: user[userIdField],
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role,
        table,
      },
    };
  }

  async register({ nama_lengkap, username, no_hp, email, password, alamat }) {
    if (await customerRepository.usernameExists(username)) {
      throw Object.assign(new Error('Username sudah digunakan.'), { statusCode: 409 });
    }

    if (await customerRepository.emailExists(email)) {
      throw Object.assign(new Error('Email sudah terdaftar.'), { statusCode: 409 });
    }

    const hashed = await hashPassword(password);

    const user = await customerRepository.create({
      nama_lengkap,
      username,
      no_hp,
      email,
      password: hashed,
      alamat,
    });

    return {
      id: user.id_customer,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      status_akun: user.status_akun,
      createdAt: user.created_at,
    };
  }

  async changePassword(userId, userTable, oldPassword, newPassword) {
    let user;

    if (userTable === USER_TABLES.CUSTOMER) {
      user = await customerRepository.findByLogin(
        (await customerRepository.findById(userId)).username
      );
      if (!user) throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) throw Object.assign(new Error('Password lama salah.'), { statusCode: 401 });

      const hashed = await hashPassword(newPassword);
      await customerRepository.updatePassword(userId, hashed);
    } else if (userTable === USER_TABLES.KARYAWAN) {
      user = await karyawanRepository.findByLogin(
        (await karyawanRepository.findById(userId)).username
      );
      if (!user) throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) throw Object.assign(new Error('Password lama salah.'), { statusCode: 401 });

      const hashed = await hashPassword(newPassword);
      await karyawanRepository.updatePassword(userId, hashed);
    } else if (userTable === USER_TABLES.OWNER) {
      user = await ownerRepository.findByLogin(
        (await ownerRepository.findById(userId)).username
      );
      if (!user) throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) throw Object.assign(new Error('Password lama salah.'), { statusCode: 401 });

      const hashed = await hashPassword(newPassword);
      await ownerRepository.updatePassword(userId, hashed);
    }

    await auditLogRepository.create({
      userId,
      userTable,
      action: 'PASSWORD_CHANGED',
    });
  }
}

module.exports = new AuthService();
