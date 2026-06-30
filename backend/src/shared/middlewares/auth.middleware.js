const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { USER_TABLES } = require('../constants');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Anda belum login. Silakan login terlebih dahulu.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    if (decoded.table === USER_TABLES.CUSTOMER) {
      const { rows } = await db.query(
        'SELECT id_customer AS id, nama_lengkap, email, username, status_akun FROM customer WHERE id_customer = $1',
        [decoded.id]
      );
      if (rows.length > 0) {
        user = { ...rows[0], role: 'customer', table: 'customer' };
      }
    } else if (decoded.table === USER_TABLES.KARYAWAN) {
      const { rows } = await db.query(
        'SELECT id_karyawan AS id, nama_lengkap, email, username, role, status_akun FROM karyawan WHERE id_karyawan = $1',
        [decoded.id]
      );
      if (rows.length > 0) {
        user = { ...rows[0], table: 'karyawan' };
      }
    } else if (decoded.table === USER_TABLES.OWNER) {
      const { rows } = await db.query(
        'SELECT id_owner AS id, nama_lengkap, email, username FROM owner WHERE id_owner = $1',
        [decoded.id]
      );
      if (rows.length > 0) {
        user = { ...rows[0], role: 'owner', table: 'owner' };
      }
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User tidak ditemukan.',
      });
    }

    if (user.status_akun && user.status_akun !== 'aktif') {
      return res.status(403).json({
        status: 'error',
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak valid.',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token telah kedaluwarsa. Silakan login kembali.',
      });
    }
    next(err);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki akses untuk resource ini.',
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
