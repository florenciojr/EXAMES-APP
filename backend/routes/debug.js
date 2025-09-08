const express = require('express');
const debugController = require('../controllers/debugController');

const router = express.Router();

// Teste de conexão com banco de dados
router.get('/db', debugController.testDatabase);

// Teste de exames
router.get('/exams', debugController.testExams);

// Teste de exame específico
router.get('/exam/:id', debugController.testExamById);

// Health check
router.get('/health', debugController.healthCheck);

// Informações da API
router.get('/info', debugController.apiInfo);

module.exports = router;