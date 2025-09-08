const Exam = require('../models/Exam');

class ExamController {
  // Criar exame
  static async createExam(req, res) {
    try {
      const user_id = req.user.id; // vindo do middleware de auth
      const { type, result, exam_date, notes } = req.body;

      const examId = await Exam.create({ user_id, type, result, exam_date, notes });
      res.status(201).json({ message: 'Exame criado com sucesso', examId });
    } catch (error) {
      console.error('Erro criar exame:', error);
      res.status(500).json({ message: 'Erro ao criar exame' });
    }
  }

  // Listar exames do usuário
  static async getUserExams(req, res) {
    try {
      const user_id = req.user.id;
      const exams = await Exam.getByUser(user_id);
      res.json({ exams });
    } catch (error) {
      console.error('Erro pegar exames:', error);
      res.status(500).json({ message: 'Erro ao pegar exames' });
    }
  }

  // Pegar exame por ID
  static async getExamById(req, res) {
    try {
      const { id } = req.params;
      const exam = await Exam.getById(id);
      if (!exam) return res.status(404).json({ message: 'Exame não encontrado' });
      res.json({ exam });
    } catch (error) {
      console.error('Erro pegar exame:', error);
      res.status(500).json({ message: 'Erro ao pegar exame' });
    }
  }

  // Atualizar exame
  static async updateExam(req, res) {
    try {
      const { id } = req.params;
      const { type, result, exam_date, notes } = req.body;
      await Exam.update(id, { type, result, exam_date, notes });
      res.json({ message: 'Exame atualizado com sucesso' });
    } catch (error) {
      console.error('Erro atualizar exame:', error);
      res.status(500).json({ message: 'Erro ao atualizar exame' });
    }
  }

  // Deletar exame
  static async deleteExam(req, res) {
    try {
      const { id } = req.params;
      await Exam.delete(id);
      res.json({ message: 'Exame deletado com sucesso' });
    } catch (error) {
      console.error('Erro deletar exame:', error);
      res.status(500).json({ message: 'Erro ao deletar exame' });
    }
  }
}

module.exports = ExamController;
