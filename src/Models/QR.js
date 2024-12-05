const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QR = sequelize.define("QR", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matriculaAlumno: {
    type: DataTypes.INTEGER,
    allowNull: true, // Opcional, según el esquema original
  },
}, {
  timestamps: true, // Agrega 'createdAt' y 'updatedAt' automáticamente
});

QR.sync()
  .then(() => {
    console.log("Modelo de QR sincronizado correctamente con la base de datos.");
  })
  .catch((err) => {
    console.error("Error al sincronizar el modelo de QR con la base de datos:", err);
  });

module.exports = QR;
