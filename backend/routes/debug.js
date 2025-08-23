const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Rota para debug - ver todas as questões
router.get('/questions', async (req, res) => {
  try {
    const questions = await query(`
      SELECT q.*, e.title as exam_title 
      FROM exam_questions_pool q 
      JOIN available_exams e ON q.exam_id = e.id 
      ORDER BY q.exam_id, q.id
    `);
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para ver questões de um exame específico
router.get('/exams/:id/questions', async (req, res) => {
  try {
    const questions = await query(
      'SELECT * FROM exam_questions_pool WHERE exam_id = ? ORDER BY id',
      [req.params.id]
    );
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para ver todos os exames
router.get('/exams', async (req, res) => {
  try {
    const exams = await query('SELECT * FROM available_exams');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;