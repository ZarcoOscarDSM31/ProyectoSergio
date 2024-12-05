const { Sequelize } = require('sequelize');
const winston = require('winston');

// Configura el logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
      new winston.transports.File({ filename: 'logs/database.log' }) // Archivo de registro para las consultas a la base de datos
  ]
});
// Crear una instancia de Sequelize con los parámetros de conexión
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, // Cambiar a la dirección de tu servidor MySQL si es necesario
  dialect: 'mysql',
  logging: (msg) => logger.info(msg)
});

// Probar la conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión exitosa a MySQL.');
  })
  .catch((err) => {
    console.error('Error al conectar a MySQL:', err);
  });


// Exportar la instancia de conexión a MongoDB para su uso en otras partes del código si es necesario
module.exports = sequelize;
