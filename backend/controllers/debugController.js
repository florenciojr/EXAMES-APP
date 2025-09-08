const { query } = require('../config/database');
const Exam = require('../models/Exam');

const debugController = {
  // Teste de conexão com banco de dados
  async testDatabase(req, res) {
    try {
      console.log('🧪 Testando conexão com BD...');
      
      const result = await query('SELECT 1 + 1 as result');
      console.log('✅ Resultado do teste BD:', result[0].result);
      
      res.json({
        success: true,
        message: 'Conexão com BD funcionando!',
        data: {
          testResult: result[0].result,
          connection: 'OK'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro na conexão com BD:', error);
      res.status(500).json({
        success: false,
        message: 'Erro na conexão com BD',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Teste de exames
  async testExams(req, res) {
    try {
      console.log('🧪 Testando funcionalidade de exames...');
      
      const exams = await Exam.findAll();
      console.log('✅ Exames encontrados:', exams.length);
      
      res.json({
        success: true,
        message: 'Funcionalidade de exames funcionando!',
        data: {
          examsCount: exams.length,
          sampleExam: exams.length > 0 ? {
            id: exams[0].id,
            title: exams[0].title
          } : null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao testar exames:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao testar exames',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Teste de exame específico
  async testExamById(req, res) {
    try {
      const { id } = req.params;
      console.log('🧪 Testando exame específico ID:', id);
      
      const exam = await Exam.findById(id);
      
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exame não encontrado',
          timestamp: new Date().toISOString()
        });
      }
      
      const questions = await Exam.getQuestions(id);
      console.log('✅ Exame e questões encontrados');
      
      res.json({
        success: true,
        message: 'Exame específico funcionando!',
        data: {
          exam: {
            id: exam.id,
            title: exam.title,
            description: exam.description
          },
          questionsCount: questions.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao testar exame específico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao testar exame específico',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Health check da API
  async healthCheck(req, res) {
    try {
      res.json({ 
        success: true,
        message: '✅ API funcionando!',
        data: {
          status: 'online',
          authentication: req.user ? 'Autenticado' : 'Público',
          user: req.user ? {
            id: req.user.id,
            email: req.user.email
          } : null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      res.status(500).json({
        success: false,
        message: 'Erro no health check',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Informações da API
  async apiInfo(req, res) {
    try {
      res.json({ 
        success: true,
        message: 'Bem-vindo à API EXAMES-APP',
        data: {
          version: '1.0.0',
          status: 'online',
          authentication: req.user ? `Autenticado como ${req.user.email}` : 'Não autenticado',
          endpoints: {
            health: '/api/health',
            auth: {
              login: '/api/auth/login',
              register: '/api/auth/register',
              profile: '/api/auth/profile'
            },
            exams: {
              list: '/api/exams',
              getById: '/api/exams/:id',
              create: '/api/exams',
              addQuestion: '/api/exams/:id/questions',
              verify: '/api/exams/:id/verify'
            },
            debug: {
              database: '/api/test/db',
              exams: '/api/test/exams',
              examById: '/api/test/exam/:id'
            }
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar informações da API:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar informações da API',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = debugController;
