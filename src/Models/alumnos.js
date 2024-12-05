const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Importar modelos relacionados
const Carrera = require("./carreras");
const Rol = require("./roles");
const Tutor = require("./tutores");

const Alumno = sequelize.define("Alumno", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matricula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cuatrimestre: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  grupo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activa: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ingresos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tipoCarrera: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceA_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceW_token: {
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
  matriculaTutor: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Tutor,
      key: "matricula",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  remember_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idHuella: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "alumnos", // Nombre explícito de la tabla
  modelName: "alumnos", // Nombre explícito de la tabla
  timestamps: false, // Maneja createdAt y updatedAt automáticamente
});

// Sincronizar el modelo con la base de datos
Alumno.sync()
  .then(() => {
    console.log("Modelo de Alumno sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de Alumno con la base de datos:", err);
  });

module.exports = Alumno;
