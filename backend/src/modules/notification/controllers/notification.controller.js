const notificationService = require('../services/notification.service');

exports.getAllNotifications = async (req, res, next) => {
  try {
    const { is_read, page, limit } = req.query;
    const id_customer = req.user.id;

    const result = await notificationService.getAllNotifications({ id_customer, is_read, page, limit });

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Daftar notifikasi berhasil diambil'
    });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const id_customer = req.user.id;
    const result = await notificationService.getUnreadCount(id_customer);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Jumlah notifikasi belum dibaca'
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const id_customer = req.user.id;

    await notificationService.markAsRead({ id_notif: parseInt(id), id_customer });

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Notifikasi ditandai sudah dibaca'
    });
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { id_pemesanan, id_customer, judul, isi_pesan } = req.body;

    if (!id_customer || !judul || !isi_pesan) {
      return res.status(400).json({
        status: 'error',
        data: null,
        message: 'id_customer, judul, dan isi_pesan wajib diisi.'
      });
    }

    const notification = await notificationService.createNotification({ id_pemesanan, id_customer, judul, isi_pesan });

    res.status(201).json({
      status: 'success',
      data: notification,
      message: 'Notifikasi berhasil dikirim'
    });
  } catch (err) {
    next(err);
  }
};
