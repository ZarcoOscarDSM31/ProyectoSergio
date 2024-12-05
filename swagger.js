const fs = require('fs');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Función para buscar recursivamente archivos .js en un directorio y sus subdirectorios
function findControllerFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findControllerFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// Ruta del directorio de controladores
const controllersDir = './src/Controllers';

// Buscar recursivamente archivos .js en el directorio de controladores y subdirectorios
const controllerFiles = findControllerFiles(controllersDir);

// Definición de opciones para Swagger
const options = {
    definition: {
    openapi: '3.0.0', // Versión de OpenAPI utilizada
    info: {
      title: 'API de la Universidad Tecnológica del Valle de Toluca', // Título de la API
      version: '1.0.0', // Versión de la API
      description: 'Una API diseñada para facilitar la gestión de la Universidad Tecnológica del Valle de Toluca, una institución académica.', // Descripción de la API
    },
    servers: [
      {
        url: '/api', // URL base para la API
      },
    ],
  },
    apis: controllerFiles, // Lista de archivos .js encontrados en el directorio de controladores y subdirectorios
};

// Generar especificaciones de Swagger
const specs = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    specs,
};
