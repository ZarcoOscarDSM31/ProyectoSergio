require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const { swaggerUi, specs } = require('./swagger');
const bodyParser = require('body-parser');
const logger = require('./logger'); // Importa el módulo de registro
const sequelize = require('./src/config/db');
const cors = require('cors');
const path = require('path');
const http = require('http');
const server = http.createServer(app);
// const io = require('socket.io')(http);
const axios = require('axios'); // Importa Axios para realizar solicitudes HTTP
const fs = require('fs'); // Importa el módulo fs para manejar archivos
const socketIo = require("socket.io");
const io = socketIo(server);

//Controllers
const alumnosController = require('./src/Controllers/alumnosController');
const authController = require('./src/Controllers/Auth/authController');
const peticionesController = require('./src/Controllers/peticiones/peticionesController');

// Configurar las vistas
app.set('views', path.join(__dirname, 'public', 'views', 'alumnos'));
app.set('view engine', 'ejs'); 

// Middleware
app.use(cors({ origin: "*" })); // Usar CORS middleware con las opciones personalizadas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use('/api', alumnosController);
app.use('/api/auth', authController);
app.use('/api/peticiones', peticionesController);

// Ruta para Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

 //Ruta de bienvenida
app.get("/", (req, res) => {
 // Enviar el archivo HTML de la página de inicio
    res.sendFile(__dirname + '/public/index.html');
});

app.get("/huella", (req, res) => {
    // Enviar el archivo HTML de la página de inicio
    res.sendFile(__dirname + '/public/login.html');
});

app.get("/cuervobus", (req, res) => {
    // Enviar el archivo HTML de la página de inicio
    res.sendFile(__dirname + '/public/cuervobus.html');
});

// Ruta para descargar el APK
app.get("/descargar-apk", (req, res, next) => {
    const rutaDescarga = path.resolve(__dirname, 'public','app','CuervoApp.apk'); // Ruta de descarga del APK local

    try {
        // Verificar si el archivo existe
        fs.access(rutaDescarga, fs.constants.F_OK, (err) => {
            if (err) {
                // Si hay un error, enviar una respuesta 404 (no encontrado)
                return res.status(404).send('El archivo APK no se encuentra disponible.');
            }
            
            // Si el archivo existe, descargarlo
            res.download(rutaDescarga, 'CuervoApp.apk', (err) => {
                if (err) {
                    // Si hay un error al descargar el archivo, pasa al siguiente middleware de manejo de errores
                    return next(err);
                }
            });
        });
    } catch (error) {
        // Si ocurre un error durante la solicitud, pasa al siguiente middleware de manejo de errores
        next(error);
    }
});


// Middleware para manejo de errores
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        error: {
            message: err.message
        }
    });
});

const DirectorioImagenes = path.join(__dirname, 'assets', 'uploads');
const Directorioqr = path.join(__dirname, 'assets', 'QRs');
app.use('/imagenes', express.static(DirectorioImagenes));
app.use('/qr', express.static(Directorioqr));


// Maneja la conexión de los clientes
const users = {}; // Almacena los IDs de los usuarios conectados y sus sockets

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");

  // Maneja el registro del usuario
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`Usuario registrado con ID: ${userId} y Socket ID: ${socket.id}`);
  });

  // Maneja el inicio de patrullaje
  socket.on("patrolStarted", (data) => {
    console.log("Se inició un viaje para el usuario con ID:", data);
  });

  // Maneja la recepción de coordenadas
  socket.on("userCoordinates", (data) => {
    const { userId, latitude, longitude } = data;
    console.log(`Coordenadas recibidas del usuario ${userId}: Latitud ${latitude}, Longitud ${longitude}`);

    // Envía las coordenadas a un cliente específico
    const targetSocketId = users[userId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("updateCoordinates", { latitude, longitude });
    }
  });

  

  // Maneja la desconexión del cliente
  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`Usuario con ID ${userId} eliminado de la lista`);
        break;
      }
    }
  });
});

// // Iniciar el servidor
app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});

//app.listen(process.env.PORT);