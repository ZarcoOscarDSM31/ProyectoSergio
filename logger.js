const winston = require('winston');

// Configuración del logger
const logger = winston.createLogger({
    level: 'info', // Nivel mínimo de registro
    format: winston.format.combine(
        winston.format.timestamp(), // Agrega la marca de tiempo a los registros
        winston.format.json() // Formato de registro JSON
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/app.log' }) // Archivo de registro
    ]
});

// Si estás en un entorno de desarrollo, también puedes enviar registros a la consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
