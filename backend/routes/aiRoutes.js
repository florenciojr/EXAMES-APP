const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Middleware para verificar se a IA está configurada
const checkIAReady = (req, res, next) => {
  const iaService = require('../services/iaService');
  if (!iaService.isReady()) {
    return res.status(503).json({
      success: false,
      error: "Serviço de IA não configurado",
      message: "Configure a GEMINI_API_KEY no ambiente"
    });
  }
  next();
};

// Rota principal da IA
router.post('/ask', checkIAReady, aiController.askQuestion);

// Rota de teste
router.get('/test', aiController.testConnection);

// Rota de status
router.get('/status', aiController.getStatus);

module.exports = router;