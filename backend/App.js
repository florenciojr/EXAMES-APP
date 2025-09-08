
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ========================================
// MIDDLEWARE BÁSICO
// ========================================

// CORS
app.use(cors());

// Parser de JSON
app.use(express.json({ limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// ========================================
// ROTAS
// ========================================

// Rotas de autenticação (públicas)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rotas de exames (protegidas)
const examRoutes = require('./routes/exams');
app.use('/api/exams', examRoutes);

// Rotas de histórico (protegidas)
const historyRoutes = require('./routes/history');
app.use('/api/history', historyRoutes);

// Rotas de IA (protegidas)
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Rotas de debug/teste (públicas)
const debugRoutes = require('./routes/debug');
app.use('/api/test', debugRoutes);

// Rotas de questões (protegidas)
const questionRoutes = require('./routes/questions');
app.use('/api/questions', questionRoutes);

// ========================================
// ROTAS ESPECIAIS
// ========================================

// Health check (público)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString(),
    authentication: req.user ? 'Autenticado' : 'Público'
  });
});

// Rota raiz (pública)
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Bem-vindo à API EXAMES-APP',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    authentication: req.user ? `Autenticado como ${req.user.email}` : 'Não autenticado',
    endpoints: {
      health: '/api/health',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        profile: '/api/auth/profile'
      },
      exams: '/api/exams',
      history: '/api/history',
      ai: '/api/ai',
      questions: '/api/questions',
      debug: '/api/test'
    }
  });
});

// ========================================
// MIDDLEWARE DE ERRO
// ========================================

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({ 
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro',
    timestamp: new Date().toISOString()
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Rede: http://172.20.10.2:${PORT}`);
  console.log(`📱 Expo Go: http://172.20.10.2:${PORT}`);
  console.log(`📊 Health Check: http://172.20.10.2:${PORT}/api/health`);
  console.log(`🔐 Login: http://172.20.10.2:${PORT}/api/auth/login`);
  console.log(`👤 Registro: http://172.20.10.2:${PORT}/api/auth/register`);
  console.log(`🧪 Debug: http://172.20.10.2:${PORT}/api/test/db`);
});

module.exports = app;