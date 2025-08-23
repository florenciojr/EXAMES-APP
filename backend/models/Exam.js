const { query } = require('../config/database');

class Exam {
  // Buscar todos os exames disponíveis
  static async findAll() {
    return await query(
      'SELECT * FROM available_exams WHERE is_active = true ORDER BY title'
    );
  }

  // Buscar exame por ID
  static async findById(id) {
    const exams = await query(
      'SELECT * FROM available_exams WHERE id = ? AND is_active = true',
      [id]
    );
    return exams[0];
  }

  // Buscar questões de um exame
  static async getQuestions(examId) {
    return await query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, 
              correct_answer, explanation, topic, difficulty 
       FROM exam_questions_pool 
       WHERE exam_id = ? 
       ORDER BY id`,
      [examId]
    );
  }

  // Criar novo exame
  static async create(examData) {
    const { title, description, subject, difficulty, total_questions, duration_minutes } = examData;
    
    const result = await query(
      `INSERT INTO available_exams 
       (title, description, subject, difficulty, total_questions, duration_minutes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, subject, difficulty, total_questions, duration_minutes]
    );
    
    return result.insertId;
  }

  // Adicionar questão a um exame
  static async addQuestion(examId, questionData) {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty } = questionData;
    
    const result = await query(
      `INSERT INTO exam_questions_pool 
       (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [examId, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty]
    );
    
    return result.insertId;
  }
}

module.exports = Exam;