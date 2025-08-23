const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Registrar usuário
router.post('/register', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
    // Verificar se usuário já existe
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    
    // Criar usuário
    const userId = await User.create({ name, email, password });
    
    // Gerar token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d',
    });
    
    // Buscar usuário criado
    const user = await User.findById(userId);
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // Verificar se usuário existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Verificar senha
    const isPasswordCorrect = await User.checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Gerar token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d',
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário
router.get('/profile', async (req, res) => {
  try {
    // Simulação - em produção usar middleware de autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;