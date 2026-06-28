const db = require('../../../shared/database/db');

class AuditLogRepository {
  async create({ userId, action, entity, entityId, ipAddress }) {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, entity, entityId, ipAddress]
    );
  }
}

module.exports = new AuditLogRepository();
