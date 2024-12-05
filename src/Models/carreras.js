const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Carrera = sequelize.define("Carrera", {
  idCarrera: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Definido como autoincremental
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, // Agrega createdAt y updatedAt
});

Carrera.sync()
  .then(() => {
    console.log("Modelo de Carrera sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de Carrera con la base de datos:", err);
  });

module.exports = Carrera;
