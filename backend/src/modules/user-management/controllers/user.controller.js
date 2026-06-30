const userService = require('../services/user.service');

exports.getCustomers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const result = await userService.getCustomers({ limit, offset });

    res.status(200).json({
      status: 'success',
      data: result.users,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getKaryawan = async (req, res, next) => {
  try {
    const role = req.query.role || null;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const result = await userService.getKaryawan({ role, limit, offset });

    res.status(200).json({
      status: 'success',
      data: result.users,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOwners = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const result = await userService.getOwners({ limit, offset });

    res.status(200).json({
      status: 'success',
      data: result.users,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const user = await userService.getUserById(table, parseInt(id));

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { nama_lengkap, username, no_hp, email, password, alamat } = req.body;

    if (!nama_lengkap || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_lengkap, username, email, dan password wajib diisi.',
      });
    }

    const user = await userService.createCustomer(
      { nama_lengkap, username, no_hp, email, password, alamat },
      req.user.role
    );

    res.status(201).json({
      status: 'success',
      message: 'Customer berhasil dibuat.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.createKaryawan = async (req, res, next) => {
  try {
    const { nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat } = req.body;

    if (!nama_lengkap || !username || !email || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'nama_lengkap, username, email, password, dan role wajib diisi.',
      });
    }

    const user = await userService.createKaryawan(
      { nama_lengkap, username, no_hp, email, password, role, hak_akses, alamat },
      req.user.role
    );

    res.status(201).json({
      status: 'success',
      message: 'Karyawan berhasil dibuat.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const data = req.body;

    const user = await userService.updateUser(table, parseInt(id), data);

    res.status(200).json({
      status: 'success',
      message: 'User berhasil diupdate.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const tempPassword = await userService.resetPassword(table, parseInt(id));

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil direset.',
      data: { temporaryPassword: tempPassword },
    });
  } catch (err) {
    next(err);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { table, id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status wajib diisi.',
      });
    }

    await userService.setStatus(table, parseInt(id), status);

    res.status(200).json({
      status: 'success',
      message: `Status user berhasil diubah menjadi ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};
