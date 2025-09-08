// backend/config/database.js

const mysql = require('mysql2/promise'); // ✅ Importe a versão com suporte a Promises
require('dotenv').config();

// Mantenha a pool de conexão fora da função para ser acessível globalmente
let pool;

const connect = async () => {
    try {
        // Crie o pool de conexão, que é mais eficiente para o servidor
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'exames_app',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10, // Defina um limite de conexões
            queueLimit: 0
        });

        // Teste a conexão para garantir que está funcionando
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        console.log('✅ Conexão com o MySQL estabelecida e testada!');
        console.log('Resultado do teste de conexão:', rows[0].solution);

    } catch (err) {
        console.error('❌ Erro ao conectar com MySQL:', err.message);
        console.log('💡 Verifique se:');
        console.log('   1. XAMPP está aberto e MySQL está iniciado.');
        console.log('   2. O banco de dados `exames_app` existe.');
        throw err; // Rejeita a promise para que o erro seja propagado
    }
};

const query = (sql, params = []) => {
    // Retorna uma Promise usando o pool para executar a query
    return new Promise((resolve, reject) => {
        pool.execute(sql, params, (err, results) => {
            if (err) {
                console.error('❌ Erro na query:', err.message);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    connect, // ✅ Exporta a função `connect`
    query
};