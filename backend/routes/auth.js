const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Registro de usuário
router.post('/register', authController.register);

// Login de usuário
router.post('/login', authController.login);

// Perfil do usuário (requer autenticação)
router.get('/profile', authController.profile);

module.exports = router;