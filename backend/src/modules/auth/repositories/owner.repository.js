const db = require('../../../shared/database/db');

class OwnerRepository {
  async findByLogin(identifier) {
    const { rows } = await db.query(
      'SELECT id_owner, nama_lengkap, username, no_hp, email, password, hak_akses FROM owner WHERE username = $1 OR email = $1',
      [identifier]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id_owner, nama_lengkap, username, no_hp, email, hak_akses, created_at FROM owner WHERE id_owner = $1',
      [id]
    );
    return rows[0] || null;
  }

  async updatePassword(id, hashedPassword) {
    await db.query('UPDATE owner SET password = $1 WHERE id_owner = $2', [hashedPassword, id]);
  }
}

module.exports = new OwnerRepository();
