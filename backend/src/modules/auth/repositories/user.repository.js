const db = require('../../../shared/database/db');

class UserRepository {
  async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT id, name, email, phone, password, role, is_locked, failed_attempts, locked_until FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, name, email, phone, role, is_locked FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async emailExists(email) {
    const { rows } = await db.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    return rows.length > 0;
  }

  async create({ name, email, phone, password, role }) {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, phone || null, password, role]
    );
    return rows[0];
  }

  async incrementFailedAttempts(userId) {
    const { rows } = await db.query(
      `UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = $1
       RETURNING failed_attempts`,
      [userId]
    );
    return rows[0];
  }

  async lockAccount(userId, lockDurationMinutes) {
    const { rows } = await db.query(
      `UPDATE users
       SET is_locked = TRUE, locked_until = NOW() + ($2 || ' minutes')::INTERVAL
       WHERE id = $1
       RETURNING is_locked, locked_until`,
      [userId, lockDurationMinutes]
    );
    return rows[0];
  }

  async resetFailedAttempts(userId) {
    await db.query(
      'UPDATE users SET failed_attempts = 0, is_locked = FALSE, locked_until = NULL WHERE id = $1',
      [userId]
    );
  }

  async unlockAccount(userId) {
    await db.query(
      'UPDATE users SET is_locked = FALSE, failed_attempts = 0, locked_until = NULL WHERE id = $1',
      [userId]
    );
  }

  async updatePassword(userId, hashedPassword) {
    await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
  }
}

module.exports = new UserRepository();
