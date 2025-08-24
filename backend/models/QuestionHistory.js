const { query } = require('../config/database');

class QuestionHistory {

  // Estatísticas do usuário (MELHORADO)
  static async getUserStats(userId) {
    try {
      const stats = await query(
        `SELECT 
           COUNT(*) as total_exams,
           SUM(score) as total_score,
           SUM(total_questions) as total_questions,
           AVG(score * 100.0 / NULLIF(total_questions, 0)) as average_score,
           SUM(time_spent) as total_time_spent,
           MAX(completed_at) as last_exam_date
         FROM exam_history 
         WHERE user_id = ?`,
        [userId]
      );
      
      // Se não houver exames, retornar valores padrão
      if (stats[0].total_exams === 0) {
        return {
          total_exams: 0,
          total_score: 0,
          total_questions: 0,
          average_score: 0,
          total_time_spent: 0,
          last_exam_date: null
        };
      }
      
      return stats[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Novo método: Estatísticas por matéria
  static async getStatsBySubject(userId) {
    try {
      const subjectStats = await query(
        `SELECT 
           exam_type,
           COUNT(*) as exam_count,
           AVG(score * 100.0 / NULLIF(total_questions, 0)) as average_score,
           SUM(score) as total_score,
           SUM(total_questions) as total_questions
         FROM exam_history 
         WHERE user_id = ?
         GROUP BY exam_type
         ORDER BY exam_count DESC`,
        [userId]
      );
      
      return subjectStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas por matéria:', error);
      throw error;
    }
  }

  // Criar histórico de exame
  static async create(historyData) {
    const { user_id, exam_type, score, total_questions, time_spent } = historyData;
    
    console.log('Executando query para criar histórico:', historyData);
    
    // Garantir que nenhum valor seja undefined
    const safeData = {
      user_id: user_id || null,
      exam_type: exam_type || 'Exame Desconhecido',
      score: score !== undefined ? score : 0,
      total_questions: total_questions !== undefined ? total_questions : 0,
      time_spent: time_spent !== undefined ? time_spent : 0
    };
    
    console.log('Dados seguros para inserção:', safeData);
    
    const result = await query(
      `INSERT INTO exam_history 
       (user_id, exam_type, score, total_questions, time_spent) 
       VALUES (?, ?, ?, ?, ?)`,
      [safeData.user_id, safeData.exam_type, safeData.score, safeData.total_questions, safeData.time_spent]
    );
    
    console.log('Resultado da inserção:', result);
    
    return result.insertId;
  }

  // Adicionar questões ao histórico
  static async addQuestions(historyId, questions) {
    console.log('Adicionando questões para historyId:', historyId);
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('Nenhuma questão para adicionar ou questions não é array');
      return;
    }
    
    console.log(`Inserindo ${questions.length} questões...`);
    
    for (const question of questions) {
      console.log('Inserindo questão:', question);
      
      try {
        // Garantir que nenhum campo seja undefined
        const safeQuestion = {
          question_text: question.question_text || question.question || question.text || 'Questão sem texto',
          user_answer: question.user_answer || question.userAnswer || null,
          correct_answer: question.correct_answer || question.correctAnswer || 'Resposta desconhecida',
          is_correct: question.is_correct !== undefined ? question.is_correct : 
                     (question.isCorrect !== undefined ? question.isCorrect : false),
          explanation: question.explanation || null,
          topic: question.topic || null,
          difficulty: question.difficulty || null
        };
        
        await query(
          `INSERT INTO exam_questions 
           (exam_history_id, question_text, user_answer, correct_answer, is_correct, explanation, topic, difficulty) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            historyId,
            safeQuestion.question_text,
            safeQuestion.user_answer,
            safeQuestion.correct_answer,
            safeQuestion.is_correct,
            safeQuestion.explanation,
            safeQuestion.topic,
            safeQuestion.difficulty
          ]
        );
      } catch (error) {
        console.error('Erro ao inserir questão:', error);
      }
    }
    
    console.log('Todas as questões inseridas');
  }

  // Buscar histórico por usuário
  static async findByUserId(userId) {
    return await query(
      `SELECT id, exam_type, score, total_questions, time_spent, completed_at 
       FROM exam_history 
       WHERE user_id = ? 
       ORDER BY completed_at DESC`,
      [userId]
    );
  }

  // Buscar detalhes de um exame específico com questões
  static async findWithQuestions(historyId) {
    const history = await query(
      'SELECT * FROM exam_history WHERE id = ?',
      [historyId]
    );
    
    if (history.length === 0) return null;
    
    const questions = await query(
      `SELECT question_text, user_answer, correct_answer, is_correct, explanation, topic, difficulty 
       FROM exam_questions 
       WHERE exam_history_id = ?`,
      [historyId]
    );
    
    return {
      ...history[0],
      questions
    };
  }

  // Estatísticas do usuário
  static async getUserStats(userId) {
    const stats = await query(
      `SELECT 
         COUNT(*) as total_exams,
         SUM(score) as total_score,
         SUM(total_questions) as total_questions,
         AVG(score * 100.0 / total_questions) as average_score
       FROM exam_history 
       WHERE user_id = ?`,
      [userId]
    );
    
    return stats[0];
  }
}

module.exports = QuestionHistory;