// Auth Service Placeholder
class AuthService {
  async authenticateUser(username, password) {
    return { token: 'mock-jwt-token' };
  }
}

module.exports = new AuthService();
