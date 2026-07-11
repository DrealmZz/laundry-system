const authService = require('../services/auth.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{8,20}$/;

exports.login = async (req, res, next) => {
  try {
    const identifier = (req.body.identifier || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Identifier (username/email/no_hp) dan password wajib diisi.',
      });
    }

    const result = await authService.login({ identifier, password });

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
    const nama_lengkap = (req.body.nama_lengkap || '').trim();
    const username = (req.body.username || '').trim();
    const no_hp = (req.body.no_hp || '').trim();
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    const alamat = (req.body.alamat || '').trim();

    if (!nama_lengkap || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_lengkap, username, email, dan password wajib diisi.',
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

    const result = await authService.register({ nama_lengkap, username, no_hp, email, password, alamat });

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

exports.updateProfile = async (req, res, next) => {
  try {
    const { nama_lengkap, username, email, no_hp, alamat, currentPassword } = req.body;
    const user = req.user;

    if (user.table !== 'customer') {
      return res.status(400).json({
        status: 'error',
        message: 'Fitur ini hanya untuk customer.',
      });
    }

    if (username || email) {
      if (!currentPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Masukkan password saat ini untuk mengubah username atau email.',
        });
      }

      await authService.verifyPassword(user.id, user.table, currentPassword);
    }

    const updated = await authService.updateProfile(user.id, { nama_lengkap, username, email, no_hp, alamat });

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui.',
      data: { user: updated },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email wajib diisi.',
      });
    }

    const result = await authService.forgotPassword({ email });

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { message: result.message },
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

    await authService.changePassword(req.user.id, req.user.table, oldPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah.',
    });
  } catch (err) {
    next(err);
  }
};
