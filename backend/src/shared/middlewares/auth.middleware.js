const jwt = require('jsonwebtoken');
const userRepository = require('../../modules/auth/repositories/user.repository');

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

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User tidak ditemukan.',
      });
    }

    if (user.is_locked) {
      return res.status(403).json({
        status: 'error',
        message: 'Akun Anda telah dikunci. Silakan hubungi admin.',
      });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
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
