const bcrypt = require('bcryptjs');
const db = require('../helpers/connection');

module.exports = {
  async createUser(user) {
    const password_hash = await bcrypt.hash(user.password, 10);

    await db.query(
      `INSERT INTO users
      (name, email, password_hash)
      VALUES
      (?, ?, ?)`,
      [user.name, user.email, password_hash]
    );
  },

  async getUser(userId) {
    const tmp = await db.query(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );
    return tmp.results[0];
  },

  async getUsers() {
    const users = await db.query(
      'SELECT id, name, email FROM users',
    );
    return users.results;
  },

  async deleteUser(userId) {
    await db.query(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );
  },

  async patchUser(user, userId) {
    if ('password' in user) {
      const new_password_hash = await bcrypt.hash(user.password, 10);
      user.password_hash = new_password_hash
      delete user.password
    }
    await db.query(
    `UPDATE users SET ? WHERE id = ?`,
    [user, userId]
    );
  }
}
