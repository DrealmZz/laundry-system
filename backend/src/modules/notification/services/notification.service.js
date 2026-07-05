const notificationRepository = require('../repositories/notification.repository');
const db = require('../../../shared/database/db');

class NotificationService {
  async getAllNotifications({ id_customer, is_read, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const notifications = await notificationRepository.findAll({ id_customer, is_read, limit, offset });
    const total = await notificationRepository.count({ id_customer, is_read });

    return {
      items: notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async getUnreadCount(id_customer) {
    const unread_count = await notificationRepository.countUnread(id_customer);
    return { unread_count };
  }

  async markAsRead({ id_notif, id_customer }) {
    const notification = await notificationRepository.findById(id_notif);
    if (!notification) {
      throw Object.assign(new Error('Notifikasi tidak ditemukan.'), { statusCode: 404 });
    }

    if (notification.id_customer !== id_customer) {
      throw Object.assign(new Error('Anda tidak memiliki akses ke notifikasi ini.'), { statusCode: 403 });
    }

    await notificationRepository.markAsRead({ id_notif, id_customer });

    await this._auditLog(id_customer, 'customer', 'NOTIFICATION_READ', `Notifikasi ID ${id_notif} ditandai sudah dibaca`);

    return true;
  }

  async createNotification({ id_pemesanan, id_customer, judul, isi_pesan }) {
    if (!id_customer || !judul || !isi_pesan) {
      throw Object.assign(new Error('id_customer, judul, dan isi_pesan wajib diisi.'), { statusCode: 400 });
    }

    if (judul.length < 3 || judul.length > 100) {
      throw Object.assign(new Error('Judul harus antara 3-100 karakter.'), { statusCode: 400 });
    }

    const { rows: customerRows } = await db.query(
      'SELECT id_customer FROM customer WHERE id_customer = $1',
      [id_customer]
    );
    if (customerRows.length === 0) {
      throw Object.assign(new Error('Customer tidak ditemukan.'), { statusCode: 404 });
    }

    if (id_pemesanan) {
      const { rows: pemesananRows } = await db.query(
        'SELECT id_pemesanan FROM pemesanan WHERE id_pemesanan = $1',
        [id_pemesanan]
      );
      if (pemesananRows.length === 0) {
        throw Object.assign(new Error('Pemesanan tidak ditemukan.'), { statusCode: 404 });
      }
    }

    const notification = await notificationRepository.create({ id_pemesanan, id_customer, judul, isi_pesan });

    await this._auditLog(null, 'karyawan', 'NOTIFICATION_SENT', `Notifikasi "${judul}" berhasil dikirim ke customer ID ${id_customer}`);

    return notification;
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

module.exports = new NotificationService();
