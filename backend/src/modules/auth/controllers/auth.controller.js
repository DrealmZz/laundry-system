const authService = require('../services/auth.service');

const ALLOWED_ROLES = ['customer', 'kasir', 'admin', 'owner'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    const role = (req.body.role || '').trim();
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, dan role wajib diisi.',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid.',
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: `Role tidak valid. Pilih: ${ALLOWED_ROLES.join(', ')}.`,
      });
    }

    const result = await authService.login({ email, password, role }, ipAddress);

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim();
    const phone = (req.body.phone || '').trim();
    const password = req.body.password || '';
    const role = (req.body.role || 'customer').trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, dan password wajib diisi.',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password minimal 6 karakter.',
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: `Role tidak valid. Pilih: ${ALLOWED_ROLES.join(', ')}.`,
      });
    }

    const result = await authService.register({ name, email, phone, password, role });

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logout berhasil. Silakan hapus token di client.',
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const oldPassword = req.body.oldPassword || '';
    const newPassword = req.body.newPassword || '';

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password lama dan password baru wajib diisi.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password baru minimal 6 karakter.',
      });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    const newPassword = req.body.newPassword || '';

    if (!email || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email dan password baru wajib diisi.',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password baru minimal 6 karakter.',
      });
    }

    await authService.resetPassword(email, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil direset.',
    });
  } catch (err) {
    next(err);
  }
};
