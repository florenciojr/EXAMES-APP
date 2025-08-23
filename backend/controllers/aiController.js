const iaService = require('../services/iaService');

const aiController = {
  async askQuestion(req, res) {
    try {
      const { question, options = [], history = [] } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Parâmetro 'question' é obrigatório"
        });
      }

      const response = await iaService.askQuestion(question, options, history);
      
      res.json({
        success: true,
        answer: response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  async testConnection(req, res) {
    try {
      const result = await iaService.testConnection();
      
      if (result.success) {
        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          ...result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  getStatus(req, res) {
    res.json({
      success: true,
      configured: iaService.isReady(),
      service: "Gemini AI",
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = aiController;