const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Rol = sequelize.define("Rol", {
  idRol: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true, // Permite nulos según la definición original
  },
}, {
  tableName: "roles", // Nombre explícito de la tabla
  modelName: "roles", // Nombre explícito de la tabla
  timestamps: true, // Maneja createdAt y updatedAt automáticamente
});

Rol.sync()
  .then(() => {
    console.log("Modelo de Rol sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de Rol con la base de datos:", err);
  });

module.exports = Rol;
