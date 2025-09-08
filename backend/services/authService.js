const jwt = require('jsonwebtoken');

const authService = {
  // Gerar token JWT
  generateToken: (payload) => {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
  },

  // Verificar token JWT
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      throw new Error('Token inválido');
    }
  },

  // Extrair token do header
  extractToken: (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
};

module.exports = authService;