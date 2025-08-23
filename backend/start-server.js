#!/usr/bin/env node
const { testConnection } = require('./config/database');
const { spawn } = require('child_process');
require('dotenv').config();

console.log('🚀 Iniciando EXAMES-APP...');
console.log('📋 Verificando configuração...');

// Verificar variáveis de ambiente
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.log('❌ Variáveis de ambiente faltando:', missingEnvVars.join(', '));
  console.log('💡 Verifique o arquivo .env');
  process.exit(1);
}

// Testar conexão com o banco
async function startServer() {
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('❌ Não foi possível conectar ao MySQL. Verifique o XAMPP.');
    console.log('💡 Dica: Abra o XAMPP e inicie o MySQL');
    process.exit(1);
  }

  console.log('✅ Tudo configurado! Iniciando servidor...');
  
  // Iniciar o servidor
  const server = spawn('node', ['app.js'], { stdio: 'inherit' });
  
  server.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
  });
  
  server.on('close', (code) => {
    console.log(`🔚 Servidor finalizado com código: ${code}`);
  });
}

startServer();