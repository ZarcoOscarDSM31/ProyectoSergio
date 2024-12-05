const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Rol = require("./roles"); // Relación con roles
const Carrera = require("./carreras"); // Relación con carreras

const Usuario = sequelize.define("Usuario", {
  idUsuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  matricula: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  Contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remember_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idRol: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Rol,
      key: "idRol",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  idCarrera: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Carrera,
      key: "idCarrera",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
}, {
  timestamps: false, // Agrega createdAt y updatedAt
});

Usuario.sync()
  .then(() => {
    console.log("Modelo de Usuario sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de Usuario con la base de datos:", err);
  });

module.exports = Usuario;
