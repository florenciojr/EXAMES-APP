const { query } = require('../config/database');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const result = await query(sql, [name, email, password]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0];
  }

  static async findById(id) {
    const sql = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0];
  }
}

module.exports = User;