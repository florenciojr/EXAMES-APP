const express = require('express');
const QuestionHistory = require('../models/QuestionHistory');

const router = express.Router();

// Salvar histórico de questões (CORRIGIDO para aceitar ambos os formatos)
router.post('/save-history', async (req, res) => {
  try {
    console.log('=== DADOS RECEBIDOS ===');
    console.log('Body completo:', req.body);
    
    // Aceitar ambos os formatos: camelCase e snake_case
    const {
      user_id, userId, // snake_case ou camelCase
      exam_type, examType, // snake_case ou camelCase  
      questions,
      score,
      total_questions, totalQuestions, // snake_case ou camelCase
      time_spent, timeSpent // snake_case ou camelCase
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
    
    console.log('Dados sanitizados:', sanitizedData);
    
    // Validar campos obrigatórios
    if (sanitizedData.user_id === null || !sanitizedData.exam_type) {
      console.log('❌ Campos obrigatórios faltando: user_id e exam_type');
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando: user_id, exam_type' 
      });
    }
    
    console.log('✅ Campos válidos, criando histórico...');
    
    // Criar histórico
    const historyId = await QuestionHistory.create(sanitizedData);
    
    console.log('✅ Histórico criado com ID:', historyId);
    
    // Adicionar questões ao histórico
    await QuestionHistory.addQuestions(historyId, sanitizedData.questions);
    
    console.log('🎉 Histórico salvo com sucesso!');
    
    res.status(201).json({ 
      message: 'Histórico salvo com sucesso',
      historyId 
    });
  } catch (error) {
    console.error('❌ ERRO COMPLETO:');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

module.exports = router;