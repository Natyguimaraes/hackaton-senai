import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'suport_senai',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

//  testar a conexão
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    throw error;
  }
};

export default pool;
