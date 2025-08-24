const express = require('express');
const QuestionHistory = require('../models/QuestionHistory');
const router = express.Router();


// Estatísticas do usuário
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('📊 Buscando estatísticas para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId é obrigatório'
      });
    }
    
    const stats = await QuestionHistory.getUserStats(userId);
    const subjectStats = await QuestionHistory.getStatsBySubject(userId);
    
    console.log('✅ Estatísticas encontradas:', stats);
    
    res.json({
      success: true,
      data: {
        ...stats,
        by_subject: subjectStats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

// Estatísticas via query parameter (alternativa)
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log('📊 Buscando estatísticas via query para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId é obrigatório (use /user/:userId/stats ou ?userId=)'
      });
    }
    
    const stats = await QuestionHistory.getUserStats(userId);
    const subjectStats = await QuestionHistory.getStatsBySubject(userId);
    
    res.json({
      success: true,
      data: {
        ...stats,
        by_subject: subjectStats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});



// Health check da rota
router.get('/health', (req, res) => {
  console.log('✅ Health check da rota de histórico');
  res.json({
    success: true,
    message: 'Rota de histórico funcionando',
    timestamp: new Date().toISOString()
  });
});

// Salvar histórico de questões
router.post('/save-history', async (req, res) => {
  try {
    console.log('=== 📥 DADOS RECEBIDOS NO /save-history ===');
    console.log('Body completo:', JSON.stringify(req.body, null, 2));
    
    // Aceitar ambos os formatos: camelCase e snake_case
    const {
      user_id, userId,
      exam_type, examType,  
      questions,
      score,
      total_questions, totalQuestions,
      time_spent, timeSpent
    } = req.body;
    
    // Usar snake_case como padrão, fallback para camelCase
    const sanitizedData = {
      user_id: user_id || userId || null,
      exam_type: exam_type || examType || 'Exame Desconhecido',
      score: score !== undefined ? score : 0,
      total_questions: total_questions || totalQuestions || 0,
      time_spent: time_spent || timeSpent || 0,
      questions: questions && Array.isArray(questions) ? questions : []
    };
    
    console.log('✅ Dados sanitizados:', sanitizedData);
    
    // Validar campos obrigatórios
    if (sanitizedData.user_id === null) {
      console.log('❌ user_id é obrigatório');
      return res.status(400).json({ 
        success: false,
        message: 'user_id é obrigatório' 
      });
    }

    if (!sanitizedData.exam_type) {
      console.log('❌ exam_type é obrigatório');
      return res.status(400).json({ 
        success: false,
        message: 'exam_type é obrigatório' 
      });
    }
    
    console.log('✅ Campos válidos, criando histórico...');
    
    // Criar histórico
    const historyId = await QuestionHistory.create(sanitizedData);
    
    console.log('✅ Histórico criado com ID:', historyId);
    
    // Adicionar questões ao histórico
    if (sanitizedData.questions.length > 0) {
      await QuestionHistory.addQuestions(historyId, sanitizedData.questions);
      console.log(`✅ ${sanitizedData.questions.length} questões adicionadas`);
    }
    
    console.log('🎉 Histórico salvo com sucesso!');
    
    res.status(201).json({ 
      success: true,
      message: 'Histórico salvo com sucesso',
      historyId 
    });

  } catch (error) {
    console.error('❌ ERRO em /save-history:');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

// Buscar histórico por usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('📋 Buscando histórico para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId é obrigatório'
      });
    }
    
    const history = await QuestionHistory.findByUserId(userId);
    
    console.log(`✅ ${history.length} registros encontrados para usuário ${userId}`);
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico',
      error: error.message
    });
  }
});

// Buscar histórico (rota alternativa para compatibilidade)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    console.log('📋 Buscando histórico via query para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId é obrigatório (use /user/:userId ou ?userId=)'
      });
    }
    
    const history = await QuestionHistory.findByUserId(userId);
    
    console.log(`✅ ${history.length} registros encontrados para usuário ${userId}`);
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico',
      error: error.message
    });
  }
});

module.exports = router;