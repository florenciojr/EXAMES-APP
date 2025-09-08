// backend/models/User.js

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await query(sql, [email]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    static async create({ name, email, password }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            const [result] = await query(sql, [name, email, hashedPassword]);
            
            return {
                id: result.insertId,
                name,
                email
            };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }
}

module.exports = User;