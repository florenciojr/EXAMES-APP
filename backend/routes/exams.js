// backend/routes/exams.js
const express = require('express');
const Exam = require('../models/Exam');

const router = express.Router();

// Listar todos os exames disponíveis
router.get('/', async (req, res) => {
  try {
    console.log('Buscando todos os exames...');
    const exams = await Exam.findAll();
    console.log('Exames encontrados:', exams.length);
    res.json(exams);
  } catch (error) {
    console.error('Erro ao buscar exames:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar exame específico com questões
router.get('/:id', async (req, res) => {
  try {
    console.log('Buscando exame ID:', req.params.id);
    
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      console.log('Exame não encontrado');
      return res.status(404).json({ message: 'Exame não encontrado' });
    }
    
    console.log('Exame encontrado:', exam.title);
    
    const questions = await Exam.getQuestions(req.params.id);
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
      ...exam,
      questions: formattedQuestions
    });
    
  } catch (error) {
    console.error('Erro ao buscar exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo exame
router.post('/', async (req, res) => {
  try {
    const { title, description, subject, difficulty, total_questions, duration_minutes } = req.body;
    
    const examId = await Exam.create({
      title,
      description,
      subject,
      difficulty,
      total_questions,
      duration_minutes
    });
    
    res.status(201).json({ 
      message: 'Exame criado com sucesso',
      examId 
    });
  } catch (error) {
    console.error('Erro ao criar exame:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar questão a um exame
router.post('/:id/questions', async (req, res) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic, difficulty } = req.body;
    
    const questionId = await Exam.addQuestion(req.params.id, {
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
      message: 'Questão adicionada com sucesso',
      questionId 
    });
  } catch (error) {
    console.error('Erro ao adicionar questão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;