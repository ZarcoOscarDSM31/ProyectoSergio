const mongoose = require('mongoose');

// Definir el esquema de la huella
const HuellasSchema = new mongoose.Schema({
    idHuella: { type: Number, required: true },
    // huella: { type: String, required: true }, // Campo para almacenar la huella digital
    createdAt: { type: Date, default: Date.now } // Campo para el timestamp, se establecerá automáticamente al crear un registro
});

// Crear el modelo Huellas a partir del esquema
const Huellas = mongoose.model('Huellas', HuellasSchema, 'Huellas');

// Exportar el modelo Huellas para su uso en otras partes de la aplicación
module.exports = Huellas;
