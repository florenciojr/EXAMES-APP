const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Definir rotas públicas que não precisam de autenticação
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/health',
      '/api/test/db',
      '/api/test/exams',
      '/api/test/exam',
      '/api/debug/routes'
    ];

    // Verificar se a rota atual é pública
    const isPublicRoute = publicRoutes.some(route => {
      // Para rotas com parâmetros como /api/test/exam/:id
      if (route.includes(':')) {
        const baseRoute = route.split('/:')[0];
        return req.path.startsWith(baseRoute);
      }
      return req.path === route;
    });

    // Se for rota pública, passar sem verificar token
    if (isPublicRoute) {
      return next();
    }

    let token;
    
    // Verificar se o token está no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token não fornecido' 
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Buscar usuário
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido - usuário não encontrado' 
      });
    }
    
    // Adicionar usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro interno no servidor' 
    });
  }
};

module.exports = authMiddleware;