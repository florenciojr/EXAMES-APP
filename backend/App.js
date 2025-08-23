const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Importar e usar rotas
const loadRoutes = (path, routeName) => {
  try {
    const routes = require(path);
    app.use(`/api/${routeName}`, routes);
    console.log(`✅ Rotas de ${routeName} carregadas`);
  } catch (error) {
    console.error(`❌ Erro ao carregar rotas de ${routeName}:`, error.message);
  }
};

// Carregar todas as rotas
loadRoutes('./routes/auth', 'auth');
loadRoutes('./routes/questions', 'questions');
loadRoutes('./routes/exams', 'exams');
loadRoutes('./routes/history', 'history');
loadRoutes('./routes/aiRoutes', 'ai');

// Rota de saúde
app.get('/api/health', (req, res) => {
  const iaService = require('./services/iaService');
  
  res.json({ 
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      questions: '/api/questions',
      exams: '/api/exams',
      history: '/api/history',
      ai: '/api/ai'
    },
    services: {
      gemini_ai: iaService.isReady(),
      database: true
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bem-vindo à API EXAMES-APP',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      exams: '/api/exams',
      auth: '/api/auth',
      ai: '/api/ai'
    }
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro'
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  const iaService = require('./services/iaService');
  
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Local: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Rede: http://192.168.1.2:${PORT}/api/health`);
  console.log(`🤖 IA: http://localhost:${PORT}/api/ai`);
  console.log(`🔑 Gemini API: ${iaService.isReady() ? '✅ Configurada' : '❌ Não configurada'}`);
});