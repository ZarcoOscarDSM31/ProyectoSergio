const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tutor = sequelize.define("Tutor", {
  idTutor: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matricula: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
  },
  remember_token: {
    type: DataTypes.STRING,
  },
  idCarrera: {
    type: DataTypes.INTEGER,
    allowNull: true, // Cambiado a true
    references: {
      model: 'carreras',
      key: 'idCarrera',
    },
    onDelete: 'CASCADE', // O 'RESTRICT'
    onUpdate: 'CASCADE',
  },
  idRol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'idRol',
    },
    onDelete: 'CASCADE', // O 'RESTRICT'
    onUpdate: 'CASCADE',
  },
  img: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

Tutor.sync()
  .then(() => console.log("Modelo de Tutor sincronizado correctamente."))
  .catch((err) => console.error("Error al sincronizar el modelo de Tutor:", err));

module.exports = Tutor;
