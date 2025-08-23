// backend/routes/history.js
const express = require('express');
const QuestionHistory = require('../models/QuestionHistory'); // Você precisa criar este modelo

const router = express.Router();

// Salvar histórico de questões
router.post('/save-history', async (req, res) => {
  try {
    console.log('Dados recebidos para save-history:', req.body);
    
    const { user_id, exam_type, questions, score, total_questions, time_spent } = req.body;
    
    // Validar campos obrigatórios
    if (!user_id || !exam_type || score === undefined || !total_questions) {
      console.log('Campos faltando:', { user_id, exam_type, score, total_questions });
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando' 
      });
    }
    
    console.log('Criando histórico no banco...');
    
    // Criar histórico
    const historyId = await QuestionHistory.create({
      user_id,
      exam_type,
      score,
      total_questions,
      time_spent: time_spent || 0
    });
    
    console.log('Histórico criado com ID:', historyId);
    
    // Se houver questões, adicionar ao histórico
    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log('Adicionando', questions.length, 'questões ao histórico');
      await QuestionHistory.addQuestions(historyId, questions);
    }
    
    console.log('Histórico salvo com sucesso');
    
    res.status(201).json({ 
      message: 'Histórico salvo com sucesso',
      historyId 
    });
  } catch (error) {
    console.error('Erro completo ao salvar histórico:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

// Buscar histórico do usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await QuestionHistory.findByUserId(req.params.userId);
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;