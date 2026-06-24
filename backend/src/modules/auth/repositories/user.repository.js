// Auth Repository Placeholder
const db = require('../../../shared/database/db');

class UserRepository {
  async findByUsername(username) {
    // return db.query('SELECT * FROM users WHERE username = $1', [username]);
    return null;
  }
}

module.exports = new UserRepository();
