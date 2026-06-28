const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../../../shared/utils');
const userRepository = require('../repositories/user.repository');
const auditLogRepository = require('../repositories/audit-log.repository');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

class AuthService {
  async login({ email, password, role }, ipAddress) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw Object.assign(new Error('Email atau password salah.'), { statusCode: 401 });
    }

    if (user.role !== role) {
      throw Object.assign(new Error(`Akun ini bukan role ${role}.`), { statusCode: 403 });
    }

    if (user.is_locked) {
      const now = new Date();
      const lockedUntil = new Date(user.locked_until);

      if (now < lockedUntil) {
        const remainingMs = lockedUntil - now;
        const remainingMin = Math.ceil(remainingMs / 60000);
        throw Object.assign(
          new Error(`Akun terkunci. Coba lagi dalam ${remainingMin} menit.`),
          { statusCode: 423 }
        );
      }

      await userRepository.unlockAccount(user.id);
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      const updated = await userRepository.incrementFailedAttempts(user.id);

      await auditLogRepository.create({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entity: 'users',
        entityId: user.id,
        ipAddress,
      });

      if (updated.failed_attempts >= MAX_FAILED_ATTEMPTS) {
        await userRepository.lockAccount(user.id, LOCK_DURATION_MINUTES);

        throw Object.assign(
          new Error(`Akun terkunci karena ${MAX_FAILED_ATTEMPTS}x gagal login. Coba lagi dalam ${LOCK_DURATION_MINUTES} menit.`),
          { statusCode: 423 }
        );
      }

      const remaining = MAX_FAILED_ATTEMPTS - updated.failed_attempts;
      throw Object.assign(
        new Error(`Email atau password salah. Sisa percobaan: ${remaining}.`),
        { statusCode: 401 }
      );
    }

    await userRepository.resetFailedAttempts(user.id);

    await auditLogRepository.create({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entity: 'users',
      entityId: user.id,
      ipAddress,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register({ name, email, phone, password, role }) {
    const exists = await userRepository.emailExists(email);
    if (exists) {
      throw Object.assign(new Error('Email sudah terdaftar.'), { statusCode: 409 });
    }

    const hashed = await hashPassword(password);

    const user = await userRepository.create({
      name,
      email,
      phone,
      password: hashed,
      role,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId)).email
    );

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      throw Object.assign(new Error('Password lama salah.'), { statusCode: 401 });
    }

    const hashed = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashed);

    await auditLogRepository.create({
      userId,
      action: 'PASSWORD_CHANGED',
      entity: 'users',
      entityId: userId,
      ipAddress: null,
    });
  }

  async resetPassword(email, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Email tidak ditemukan.'), { statusCode: 404 });
    }

    const hashed = await hashPassword(newPassword);
    await userRepository.updatePassword(user.id, hashed);

    await auditLogRepository.create({
      userId: user.id,
      action: 'PASSWORD_RESET',
      entity: 'users',
      entityId: user.id,
      ipAddress: null,
    });
  }
}

module.exports = new AuthService();
