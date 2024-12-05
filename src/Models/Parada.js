const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");  // Importa la instancia de Sequelize

// Define el modelo Parada
const Parada = sequelize.define('Parada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitud: {
    type: DataTypes.FLOAT(),
    allowNull: false,
},
longitud: {
    type: DataTypes.FLOAT(),
    allowNull: false,
},
  ruta: {
    type: DataTypes.INTEGER,  // Se usa JSON para almacenar un arreglo de coordenadas (lat, lon)
    allowNull: false,
  },
}, {
  tableName: 'paradas',  // Nombre de la tabla
  timestamps: false,     // Deshabilitar las columnas createdAt y updatedAt
});

module.exports = Parada;
