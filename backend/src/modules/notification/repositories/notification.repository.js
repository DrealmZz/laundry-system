const db = require('../../../shared/database/db');

class NotificationRepository {
  async findAll({ id_customer, is_read, limit = 20, offset = 0 } = {}) {
    let query = 'SELECT id_notif, id_pemesanan, judul, isi_pesan, is_read, created_at FROM notifikasi WHERE id_customer = $1';
    const params = [id_customer];
    let paramIndex = 2;

    if (is_read !== undefined && is_read !== null) {
      query += ` AND is_read = $${paramIndex++}`;
      params.push(is_read);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_notif, id_pemesanan, id_customer, judul, isi_pesan, is_read, created_at FROM notifikasi WHERE id_notif = $1',
      [id]
    );
    return rows[0] || null;
  }

  async countUnread(id_customer) {
    const { rows } = await db.query(
      'SELECT COUNT(*) FROM notifikasi WHERE id_customer = $1 AND is_read = FALSE',
      [id_customer]
    );
    return parseInt(rows[0].count);
  }

  async count({ id_customer, is_read } = {}) {
    let query = 'SELECT COUNT(*) FROM notifikasi WHERE id_customer = $1';
    const params = [id_customer];
    let paramIndex = 2;

    if (is_read !== undefined && is_read !== null) {
      query += ` AND is_read = $${paramIndex++}`;
      params.push(is_read);
    }

    const { rows } = await db.query(query, params);
    return parseInt(rows[0].count);
  }

  async create({ id_pemesanan, id_customer, judul, isi_pesan }) {
    const { rows } = await db.query(
      `INSERT INTO notifikasi (id_pemesanan, id_customer, judul, isi_pesan)
       VALUES ($1, $2, $3, $4)
       RETURNING id_notif, id_pemesanan, id_customer, judul, isi_pesan, is_read, created_at`,
      [id_pemesanan || null, id_customer, judul, isi_pesan]
    );
    return rows[0];
  }

  async markAsRead({ id_notif, id_customer }) {
    const { rowCount } = await db.query(
      'UPDATE notifikasi SET is_read = TRUE WHERE id_notif = $1 AND id_customer = $2',
      [id_notif, id_customer]
    );
    return rowCount > 0;
  }
}

module.exports = new NotificationRepository();
