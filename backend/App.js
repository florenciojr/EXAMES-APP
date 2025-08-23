const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());
app.use('/api/debug', require('./routes/debug'));

// Importar e usar rotas
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Rotas de autenticação carregadas');
} catch (error) {
  console.error('❌ Erro ao carregar rotas de auth:', error.message);
}

try {
  const questionsRoutes = require('./routes/questions');
  app.use('/api/questions', questionsRoutes);
  console.log('✅ Rotas de questões carregadas');
} catch (error) {
  console.error('❌ Erro ao carregar rotas de questions:', error.message);
}

try {
  const examsRoutes = require('./routes/exams');
  app.use('/api/exams', examsRoutes);
  console.log('✅ Rotas de exames carregadas');
} catch (error) {
  console.error('❌ Erro ao carregar rotas de exams:', error.message);
}

// ✅ ADICIONE ESTAS LINHAS PARA AS ROTAS DE HISTÓRICO
try {
  const historyRoutes = require('./routes/history');
  app.use('/api/history', historyRoutes);
  console.log('✅ Rotas de histórico carregadas');
} catch (error) {
  console.error('❌ Erro ao carregar rotas de history:', error.message);
}

// Rota do askAI
app.post('/askAI', async (req, res) => {
  try {
    const { question, options } = req.body;
    
    // Resposta simulada
    const simulatedResponse = `Como assistente de estudos, vou ajudar você com a questão: "${question}". 
    As opções são: ${options.join(', ')}. 
    Tente pensar sobre o conceito principal envolvido na pergunta.`;
    
    res.json({ answer: simulatedResponse });
  } catch (err) {
    console.error("Erro no askAI:", err);
    res.status(500).json({ 
      error: "Erro ao processar solicitação",
      message: err.message 
    });
  }
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      questions: '/api/questions',
      exams: '/api/exams',
      history: '/api/history', // ✅ Adicione esta linha
      ai: '/askAI'
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bem-vindo à API EXAMES-APP',
    version: '1.0.0',
    status: 'online'
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
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Local: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Rede: http://10.240.150.168:${PORT}/api/health`);
});