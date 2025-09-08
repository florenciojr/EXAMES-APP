// backend/routes/exams.js
const express = require('express');
const examController = require('../controllers/examController');

const router = express.Router();

// Listar todos os exames disponíveis
router.get('/', examController.getAllExams);

// Buscar exame específico com questões
router.get('/:id', examController.getExamById);

// Criar novo exame
router.post('/', examController.createExam);

// Adicionar questão a um exame
router.post('/:id/questions', examController.addQuestion);

// Verificar respostas de um exame
router.post('/:id/verify', examController.verifyAnswers);

module.exports = router;