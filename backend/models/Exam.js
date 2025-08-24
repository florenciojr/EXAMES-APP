const { query } = require('../config/database');

class Exam {
  // Buscar todos os exames disponíveis
  static async findAll() {
    try {
      console.log('📊 Buscando todos os exames na BD...');
      const exams = await query(
        'SELECT * FROM available_exams WHERE is_active = true ORDER BY title'
      );
      console.log(`✅ Encontrados ${exams.length} exames na BD`);
      return exams;
    } catch (error) {
      console.error('❌ Erro ao buscar exames na BD:', error);
      throw error;
    }
  }

  // Buscar exame por ID
  static async findById(id) {
    try {
      console.log(`📊 Buscando exame ID: ${id} na BD...`);
      const exams = await query(
        'SELECT * FROM available_exams WHERE id = ? AND is_active = true',
        [id]
      );
      
      if (exams.length === 0) {
        console.log(`❌ Exame ${id} não encontrado na BD`);
        return null;
      }
      
      console.log(`✅ Exame ${id} encontrado na BD: ${exams[0].title}`);
      return exams[0];
    } catch (error) {
      console.error('❌ Erro ao buscar exame por ID:', error);
      throw error;
    }
  }

  // Buscar questões de um exame
  static async getQuestions(examId) {
    try {
      console.log(`📊 Buscando questões do exame ${examId} na BD...`);
      const questions = await query(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, 
                correct_answer, explanation, topic, difficulty 
         FROM exam_questions_pool 
         WHERE exam_id = ? 
         ORDER BY id`,
        [examId]
      );
      
      console.log(`✅ Encontradas ${questions.length} questões para exame ${examId}`);
      return questions;
    } catch (error) {
      console.error('❌ Erro ao buscar questões:', error);
      throw error;
    }
  }

  // Buscar exames por matéria
  static async findBySubject(subject) {
    try {
      console.log(`📊 Buscando exames de ${subject} na BD...`);
      const exams = await query(
        'SELECT * FROM available_exams WHERE subject = ? AND is_active = true ORDER BY title',
        [subject]
      );
      console.log(`✅ Encontrados ${exams.length} exames de ${subject}`);
      return exams;
    } catch (error) {
      console.error('❌ Erro ao buscar exames por matéria:', error);
      throw error;
    }
  }

  // Buscar histórico de exames do aluno
  static async getStudentExamHistory(studentId) {
    try {
      console.log(`📊 Buscando histórico do aluno ${studentId} na BD...`);
      const history = await query(
        `SELECT eh.*, ae.title, ae.subject 
         FROM exam_history eh 
         JOIN available_exams ae ON eh.exam_id = ae.id 
         WHERE eh.user_id = ? 
         ORDER BY eh.completed_at DESC`,
        [studentId]
      );
      console.log(`✅ Encontrados ${history.length} exames no histórico`);
      return history;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // Verificar se aluno já fez o exame
  static async hasStudentTakenExam(studentId, examId) {
    try {
      console.log(`📊 Verificando se aluno ${studentId} fez exame ${examId}...`);
      const result = await query(
        'SELECT COUNT(*) as count FROM exam_history WHERE user_id = ? AND exam_id = ?',
        [studentId, examId]
      );
      const taken = result[0].count > 0;
      console.log(`✅ Aluno ${studentId} ${taken ? 'JÁ FEZ' : 'NÃO FEZ'} exame ${examId}`);
      return taken;
    } catch (error) {
      console.error('❌ Erro ao verificar histórico:', error);
      return false;
    }
  }

  // Salvar resultado do exame
  static async saveExamResult(examData) {
    try {
      console.log('💾 Salvando resultado do exame na BD...');
      const { user_id, exam_id, score, total_questions, correct_answers, passed, answers_json } = examData;
      
      const result = await query(
        `INSERT INTO exam_history 
         (user_id, exam_id, score, total_questions, correct_answers, passed, answers_json) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, exam_id, score, total_questions, correct_answers, passed, JSON.stringify(answers_json)]
      );
      
      console.log(`✅ Resultado salvo com ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ Erro ao salvar resultado:', error);
      throw error;
    }
  }
}

module.exports = Exam;