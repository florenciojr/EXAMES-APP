const express = require('express');
const ExamController = require('../controllers/ExamController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas rotas usam autenticação
router.use(authMiddleware);

router.post('/', ExamController.createExam);
router.get('/', ExamController.getUserExams);
router.get('/:id', ExamController.getExamById);
router.put('/:id', ExamController.updateExam);
router.delete('/:id', ExamController.deleteExam);

module.exports = router;
