const Exam = require('../models/Exam');

const examController = {
  // Listar todos os exames disponíveis
  async getAllExams(req, res) {
    try {
      console.log('Buscando todos os exames...');
      const exams = await Exam.findAll();
      console.log('Exames encontrados:', exams.length);
      
      res.json({
        success: true,
        data: exams,
        count: exams.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Buscar exame específico com questões
  async getExamById(req, res) {
    try {
      const { id } = req.params;
      console.log('Buscando exame ID:', id);
      
      const exam = await Exam.findById(id);
      
      if (!exam) {
        console.log('Exame não encontrado');
        return res.status(404).json({ 
          success: false,
          message: 'Exame não encontrado' 
        });
      }
      
      console.log('Exame encontrado:', exam.title);
      
      const questions = await Exam.getQuestions(id);
      console.log('Questões encontradas:', questions.length);
      
      // Formatar as questões para o frontend
      const formattedQuestions = questions.map(q => ({
        id: q.id,
        text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        answer: ['a', 'b', 'c', 'd'].indexOf(q.correct_answer.toLowerCase()),
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty
      }));
      
      res.json({
        success: true,
        data: {
          ...exam,
          questions: formattedQuestions
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro ao buscar exame:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Criar novo exame
  async createExam(req, res) {
    try {
      const { title, description, subject, difficulty, total_questions, duration_minutes } = req.body;
      
      // Validações básicas
      if (!title || !description || !subject) {
        return res.status(400).json({
          success: false,
          message: 'Título, descrição e matéria são obrigatórios'
        });
      }
      
      const examId = await Exam.create({
        title,
        description,
        subject,
        difficulty,
        total_questions,
        duration_minutes
      });
      
      res.status(201).json({ 
        success: true,
        message: 'Exame criado com sucesso',
        data: { examId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao criar exame:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Adicionar questão a um exame
  async addQuestion(req, res) {
    try {
      const { id } = req.params;
      const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty } = req.body;
      
      // Validações básicas
      if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
        return res.status(400).json({
          success: false,
          message: 'Texto da questão, todas as opções e resposta correta são obrigatórios'
        });
      }
      
      const questionId = await Exam.addQuestion(id, {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        topic,
        difficulty
      });
      
      res.status(201).json({ 
        success: true,
        message: 'Questão adicionada com sucesso',
        data: { questionId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao adicionar questão:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Verificar respostas de um exame
  async verifyAnswers(req, res) {
    try {
      const { answers } = req.body; // { questionId: selectedOptionIndex }
      const examId = req.params.id;
      
      console.log('Verificando respostas para o exame:', examId);
      
      // Validações básicas
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Respostas são obrigatórias'
        });
      }
      
      // Buscar todas as questões do exame
      const questions = await Exam.getQuestions(examId);
      
      // Formatar as questões igual no GET
      const formattedQuestions = questions.map(q => ({
        id: q.id,
        correctAnswer: ['a', 'b', 'c', 'd'].indexOf(q.correct_answer.toLowerCase())
      }));
      
      // Calcular pontuação
      let score = 0;
      const results = [];
      
      for (const question of formattedQuestions) {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          score++;
        }
        
        results.push({
          questionId: question.id,
          correct: isCorrect,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer
        });
      }
      
      const totalQuestions = formattedQuestions.length;
      const percentage = Math.round((score / totalQuestions) * 100);
      
      res.json({
        success: true,
        data: {
          score,
          totalQuestions,
          percentage,
          results
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro ao verificar respostas:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = examController;
