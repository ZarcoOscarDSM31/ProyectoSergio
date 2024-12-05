const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ApiKey = sequelize.define("ApiKey", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  empresa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER, // Almacenado como un entero
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Fecha de creación por defecto
  },
});

ApiKey.sync()
  .then(() => {
    console.log("Modelo de ApiKey sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de ApiKey con la base de datos:", err);
  });

module.exports = ApiKey;
