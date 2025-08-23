const mysql = require('mysql2');
require('dotenv').config();

// Configuração da conexão
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'exames_app',
  port: process.env.DB_PORT || 3306,
});

// Conectar ao banco
connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar com MySQL:', err.message);
    console.log('💡 Verifique se:');
    console.log('   1. XAMPP está aberto');
    console.log('   2. MySQL está iniciado');
    console.log('   3. Banco exames_app existe');
  } else {
    console.log('✅ Conectado ao MySQL com sucesso!');
  }
});

// Query helper function
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.execute(sql, params, (err, results) => {
      if (err) {
        console.error('❌ Erro na query:', err.message);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { connection, query };