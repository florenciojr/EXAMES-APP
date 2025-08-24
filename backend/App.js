const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();

// ... código anterior ...

// ✅ ROTAS DE TESTE RÁPIDO PARA BD
app.get('/api/test/db', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com BD...');
    const { query } = require('./config/database');
    
    // Teste simples
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

app.get('/api/test/exams', async (req, res) => {
  try {
    console.log('🧪 Testando busca de exames na BD...');
    const Exam = require('./models/Exam');
    
    const exams = await Exam.findAll();
    console.log(`✅ Encontrados ${exams.length} exames na BD`);
    
    res.json({
      success: true,
      message: `Encontrados ${exams.length} exames`,
      exams: exams,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao buscar exames:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar exames',
      error: error.message
    });
  }
});

app.get('/api/test/exam/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧪 Testando busca do exame ${id} na BD...`);
    const Exam = require('./models/Exam');
    
    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: `Exame ${id} não encontrado`
      });
    }
    
    console.log(`✅ Exame encontrado: ${exam.title}`);
    
    res.json({
      success: true,
      message: 'Exame encontrado',
      exam: exam,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao buscar exame:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar exame',
      error: error.message
    });
  }
});

app.get('/api/test/exam/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧪 Testando busca de questões do exame ${id}...`);
    const Exam = require('./models/Exam');
    
    const questions = await Exam.getQuestions(id);
    console.log(`✅ Encontradas ${questions.length} questões`);
    
    res.json({
      success: true,
      message: `Encontradas ${questions.length} questões`,
      questions: questions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao buscar questões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar questões',
      error: error.message
    });
  }
});

// ✅ ROTAS DE FALLBACK PARA COMPATIBILIDADE
app.get('/exams', (req, res) => {
  console.log('⚠️  Redirecionando /exams para /api/exams');
  req.originalUrl = '/api/exams';
  req.url = '/api/exams';
  app.handle(req, res);
});

app.get('/exams/:id', (req, res) => {
  console.log(`⚠️  Redirecionando /exams/${req.params.id} para /api/exams/${req.params.id}`);
  req.originalUrl = `/api/exams/${req.params.id}`;
  req.url = `/api/exams/${req.params.id}`;
  app.handle(req, res);
});

// ... resto do código ...

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' && (req.originalUrl.includes('login') || req.originalUrl.includes('save-history'))) {
    console.log('Body received:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ✅ FUNÇÃO MELHORADA PARA CARREGAR ROTAS
const loadRoutes = (routePath, routeName) => {
  try {
    const fullPath = path.join(__dirname, routePath);
    
    console.log(`🔍 Tentando carregar: ${fullPath}.js`);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(fullPath + '.js')) {
      console.error(`❌ Arquivo de rotas não encontrado: ${fullPath}.js`);
      
      // Tentar encontrar o arquivo em localizações alternativas
      const alternativePaths = [
        path.join(__dirname, '..', 'routes', routeName),
        path.join(__dirname, 'routes', routeName),
        path.join(__dirname, 'src', 'routes', routeName),
        path.join(__dirname, routeName) // Tentar caminho direto
      ];
      
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath + '.js')) {
          console.log(`✅ Encontrado em localização alternativa: ${altPath}.js`);
          const routes = require(altPath);
          app.use(`/api/${routeName}`, routes);
          console.log(`✅ Rotas de ${routeName} carregadas de ${altPath}.js`);
          return true;
        }
      }
      
      return false;
    }
    
    const routes = require(fullPath);
    app.use(`/api/${routeName}`, routes);
    console.log(`✅ Rotas de ${routeName} carregadas de ${fullPath}.js`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao carregar rotas de ${routeName}:`, error.message);
    return false;
  }
};

// ✅ VERIFICAR E CRIAR ROTAS DE AUTENTICAÇÃO SE NECESSÁRIO
const ensureAuthRoutes = () => {
  console.log('⚠️  Arquivo auth.js não encontrado, criando rotas básicas...');
  
  // Rota de login básica
  app.post('/api/auth/login', (req, res) => {
    console.log('📧 Login simulado (modo desenvolvimento)');
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: 1, 
        email: req.body.email 
      },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: 1,
        name: 'Usuário de Teste',
        email: req.body.email
      }
    });
  });
  
  // Rota de health check para auth
  app.get('/api/auth/health', (req, res) => {
    res.json({
      success: true,
      message: 'Rota de autenticação funcionando (modo desenvolvimento)',
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('✅ Rotas básicas de auth criadas');
  return true;
};

// ✅ VERIFICAR E CRIAR ROTAS DE EXAMES SE NECESSÁRIO
const ensureExamRoutes = () => {
  console.log('⚠️  Arquivo exams.js não encontrado, criando rotas básicas...');
  
  // Rota básica para listar exames
  app.get('/api/exams', (req, res) => {
    console.log('📝 Listando exames (modo desenvolvimento)');
    
    // Dados de exemplo para desenvolvimento
    const examesExemplo = [
      {
        id: 1,
        title: "Exemplo de Exame de Matemática",
        description: "Exame de matemática básica",
        subject: "Matemática",
        difficulty: "médio",
        total_questions: 10,
        duration_minutes: 60,
        is_active: true
      },
      {
        id: 2,
        title: "Exemplo de Exame de Português",
        description: "Exame de gramática e interpretação de texto",
        subject: "Português",
        difficulty: "fácil",
        total_questions: 8,
        duration_minutes: 45,
        is_active: true
      }
    ];
    
    res.json(examesExemplo);
  });
  
  // Rota básica para buscar exame específico
  app.get('/api/exams/:id', (req, res) => {
    const { id } = req.params;
    console.log(`📝 Buscando exame ID: ${id} (modo desenvolvimento)`);
    
    // Questões de exemplo
    const questionsExemplo = [
      {
        id: 1,
        text: "Qual é a fórmula da área do círculo?",
        options: ["πr²", "2πr", "πd", "r²"],
        answer: 0,
        explanation: "A área do círculo é calculada por π multiplicado pelo raio ao quadrado.",
        topic: "Geometria",
        difficulty: "fácil"
      },
      {
        id: 2,
        text: "Quanto é 2 + 2 × 2?",
        options: ["6", "8", "4", "10"],
        answer: 0,
        explanation: "Primeiro multiplicamos 2 × 2 = 4, depois somamos 2 + 4 = 6.",
        topic: "Aritmética",
        difficulty: "fácil"
      }
    ];
    
    const examExemplo = {
      id: parseInt(id),
      title: "Exemplo de Exame",
      description: "Este é um exame de exemplo para desenvolvimento",
      subject: "Matemática",
      difficulty: "médio",
      total_questions: 2,
      duration_minutes: 30,
      questions: questionsExemplo
    };
    
    res.json(examExemplo);
  });
  
  // Health check para exames
  app.get('/api/exams/health', (req, res) => {
    res.json({
      success: true,
      message: 'Rota de exames funcionando (modo desenvolvimento)',
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('✅ Rotas básicas de exams criadas');
  return true;
};

// ✅ CARREGAR TODAS AS ROTAS
console.log('🔄 Carregando rotas...');

// 1. Primeiro tentar carregar auth normalmente
const authLoaded = loadRoutes('./routes/auth', 'auth');

// 2. Se auth não carregar, criar rotas básicas
if (!authLoaded) {
  ensureAuthRoutes();
}

// 3. Carregar outras rotas - com fallback
const examsLoaded = loadRoutes('./routes/exams', 'exams');
if (!examsLoaded) {
  ensureExamRoutes();
}

// 4. Carregar outras rotas com fallback básico
loadRoutes('./routes/questions', 'questions') || console.log('⚠️  Rotas de questions não carregadas');
loadRoutes('./routes/history', 'history') || console.log('⚠️  Rotas de history não carregadas');
loadRoutes('./routes/aiRoutes', 'ai') || console.log('⚠️  Rotas de AI não carregadas');

// ✅ ROTA DE FALLBACK PARA /auth/login (COMPATIBILIDADE)
app.post('/auth/login', (req, res) => {
  console.log('⚠️  Usando rota de fallback /auth/login');
  
  // Simplesmente redireciona para a rota correta
  req.originalUrl = '/api/auth/login';
  req.url = '/api/auth/login';
  app.handle(req, res);
});

// ✅ ROTA DE HEALTH CHECK MELHORADA
app.get('/api/health', (req, res) => {
  const routes = [];
  
  // Verificar todas as rotas carregadas
  app._router.stack.forEach(layer => {
    if (layer.name === 'router') {
      const routePath = layer.regexp.toString()
        .replace(/^\/\^\\\/api\\\/([^\\]+).*$/, '/api/$1')
        .replace(/\\/g, '');
      routes.push(routePath);
    }
  });
  
  res.json({ 
    success: true,
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString(),
    routes: routes.filter(route => route !== '/api/$1')
  });
});

// ✅ ROTA DE DEBUG PARA LISTAR TODAS AS ROTAS
app.get('/api/debug/routes', (req, res) => {
  const allRoutes = [];
  
  app._router.stack.forEach(layer => {
    if (layer.route) {
      // Rota direta
      allRoutes.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
        type: 'direct'
      });
    } else if (layer.name === 'router') {
      // Rota com router
      const basePath = layer.regexp.toString()
        .replace(/^\/\^\\\/api\\\/([^\\]+).*$/, '/api/$1')
        .replace(/\\/g, '');
      
      layer.handle.stack.forEach(handler => {
        if (handler.route) {
          allRoutes.push({
            path: basePath + handler.route.path,
            methods: Object.keys(handler.route.methods),
            type: 'router'
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    count: allRoutes.length,
    routes: allRoutes
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
    endpoints: {
      health: '/api/health',
      debug: '/api/debug/routes',
      auth: {
        login: '/api/auth/login',
        fallback: '/auth/login',
        health: '/api/auth/health'
      },
      exams: '/api/exams',
      examsHealth: '/api/exams/health'
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
  
  // Coletar todas as rotas disponíveis
  const availableRoutes = [];
  app._router.stack.forEach(layer => {
    if (layer.route) {
      availableRoutes.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      });
    } else if (layer.name === 'router') {
      const basePath = layer.regexp.toString()
        .replace(/^\/\^\\\/api\\\/([^\\]+).*$/, '/api/$1')
        .replace(/\\/g, '');
      
      layer.handle.stack.forEach(handler => {
        if (handler.route) {
          availableRoutes.push({
            path: basePath + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: availableRoutes.slice(0, 10) // Mostrar apenas as primeiras 10
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Rede: http://192.168.1.2:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug Routes: http://localhost:${PORT}/api/debug/routes`);
  console.log(`📝 Exams: http://localhost:${PORT}/api/exams`);
  console.log(`📝 Exam Example: http://localhost:${PORT}/api/exams/1`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`🔐 Login (fallback): http://localhost:${PORT}/auth/login`);
  console.log('');
  console.log('✅ Servidor configurado com:');
  console.log('   - Rotas de autenticação (/api/auth/login)');
  console.log('   - Rotas de exames (/api/exams)');
  console.log('   - Fallback para compatibilidade (/auth/login)');
  console.log('   - Sistema de rotas resiliente');
  console.log(`🌐 Rede: http://192.168.1.2:${PORT}`);
  console.log('');
  console.log('📊 TESTES RÁPIDOS:');
  console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   - Teste BD: http://localhost:${PORT}/api/test/db`);
  console.log(`   - Teste Exames: http://localhost:${PORT}/api/test/exams`);
  console.log(`   - Teste Exame 1: http://localhost:${PORT}/api/test/exam/1`);
  console.log(`   - Teste Questões: http://localhost:${PORT}/api/test/exam/1/questions`);
  console.log('');
  console.log('🔍 DEBUG:');
  console.log(`   - Debug Routes: http://localhost:${PORT}/api/debug/routes`);
  console.log('');
  console.log('🎯 ROTAS PRINCIPAIS:');
  console.log(`   - Exams: http://localhost:${PORT}/api/exams`);
  console.log(`   - Exam Example: http://localhost:${PORT}/api/exams/1`);
  console.log(`   - Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Login Fallback: http://localhost:${PORT}/auth/login`);

  
  // Debug das rotas após inicialização
  setTimeout(() => {
    console.log('\n🔍 ROTAS DISPONÍVEIS:');
    app._router.stack.forEach(layer => {
      if (layer.route) {
        console.log(`   ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
      } else if (layer.name === 'router') {
        const basePath = layer.regexp.toString()
          .replace(/^\/\^\\\/api\\\/([^\\]+).*$/, '/api/$1')
          .replace(/\\/g, '');
        
        layer.handle.stack.forEach(handler => {
          if (handler.route) {
            console.log(`   ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${basePath}${handler.route.path}`);
          }
        });
      }
    });
  }, 100);
});