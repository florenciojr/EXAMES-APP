const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ CARREGAR MIDDLEWARE DE AUTENTICAÇÃO
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// ✅ ROTAS DE TESTE RÁPIDO PARA BD (públicas)
app.get('/api/test/db', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com BD...');
    const { query } = require('./config/database');
    
    const result = await query('SELECT 1 + 1 as result');
    console.log('✅ Resultado do teste BD:', result[0].result);
    
    res.json({
      success: true,
      message: 'Conexão com BD funcionando!',
      testResult: result[0].result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro na conexão com BD:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com BD',
      error: error.message
    });
  }
});

// ✅ ROTAS DE AUTENTICAÇÃO (já estão públicas pelo middleware)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ✅ ROTAS PROTEGIDAS (requerem autenticação)
const examRoutes = require('./routes/exams');
app.use('/api/exams', examRoutes);

const historyRoutes = require('./routes/history');
app.use('/api/history', historyRoutes);

// ✅ ROTA DE HEALTH CHECK (pública)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString(),
    authentication: req.user ? 'Autenticado' : 'Público'
  });
});

// ✅ ROTA RAIZ MELHORADA
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
        register: '/api/auth/register'
      },
      exams: '/api/exams',
      history: '/api/history'
    }
  });
});

// ✅ MIDDLEWARE DE ERRO MELHORADO
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({ 
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro',
    timestamp: new Date().toISOString()
  });
});

// ✅ ROTA NÃO ENCONTRADA MELHORADA
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Rede: http://0.0.0.0:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`👤 Registro: http://localhost:${PORT}/api/auth/register`);
});