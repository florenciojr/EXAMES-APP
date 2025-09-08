// backend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Importar a conexão com a base de dados
const { connect } = require('./config/database');

// Importar as rotas
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware de logging (opcional)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Definir as rotas da API
app.use('/api/auth', authRoutes);

// Rota de saúde (health check)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ API funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota não encontrada (deve ser a última rota a ser definida)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl,
    });
});

// Middleware de erro genérico
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro',
    });
});

// Iniciar o servidor e a conexão com o banco de dados
connect().then(() => {
    console.log('✅ Conexão com o banco de dados estabelecida!');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📍 Local: http://localhost:${PORT}`);
        console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
    });
}).catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
});