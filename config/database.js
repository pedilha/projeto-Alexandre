const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

// Configuração de conexão
const sequelize = new Sequelize(
  process.env.DB_DATABASE,  // Nome do banco de dados
  process.env.DB_USER,      // Nome do usuário
  process.env.DB_PASSWORD,  // Senha do usuário
  {
    host: process.env.DB_HOST,  // Local do servidor (localhost)
    dialect: 'postgres',         // Dialeto usado
    port: process.env.DB_PORT    // Porta do PostgreSQL
  }
);

// Testa a conexão
sequelize.authenticate()
  .then(() => {
    console.log('Conexão ao banco de dados estabelecida com sucesso.');
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

module.exports = sequelize;
