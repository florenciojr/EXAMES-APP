const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Criar usuário
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return result.insertId;
  }

  // Encontrar usuário por email
  static async findByEmail(email) {
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0];
  }

  // Encontrar usuário por ID
  static async findById(id) {
    const users = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  }

  // Verificar senha
  static async checkPassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Atualizar usuário
  static async update(id, userData) {
    const { name, email } = userData;
    await query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return true;
  }
}

module.exports = User;