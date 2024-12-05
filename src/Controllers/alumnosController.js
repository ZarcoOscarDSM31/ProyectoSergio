const express = require("express");
const router = express.Router();
const sequelize = require('../config/db');
const alumnos = require("../Models/alumnos");
const carreras = require('../Models/carreras');
const apiKey = require("../Models/apikey");
const Conductores = require('../Models/conductor')
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Ruta para obtener los alumnos
/**
 * @swagger
 * /alumnos:
 *   get:
 *     summary: Obtiene todos los alumnos.
 *     description: Endpoint para obtener todos los alumnos.
 *     parameters:
 *       - in: query
 *         name: token
 *         description: Token de autenticación del usuario.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de alumnos obtenida correctamente.
 *       401:
 *         description: Token no válido.
 *       500:
 *         description: Error al obtener la lista de alumnos.
 */
router.get("/alumnos", async (req, res) => {
    // Obtener el token enviado por el usuario desde los parámetros de consulta en la URL
    const apiKey = req.query.token;

    try {
        // Consultar la base de datos para verificar si existe un registro que coincida con ese token y el status sea igual a 1
        const tokenExists = await verifyTokenInDatabase(apiKey);

        if (tokenExists) {
            // Si el token existe en la base de datos, ejecutar el código para obtener los alumnos
            alumnos.find({}).lean().exec()  // Ejecuta la consulta y devuelve una promesa
                .then(alumnos => {
                    //console.log('Alumnos encontrados:', alumnos);
                    res.status(200).json(alumnos); // Envía la respuesta JSON al cliente
                })
                .catch(err => {
                    //console.error('Error al buscar en la colección de alumnos:', err);
                    res.status(500).json({ error: 'Error al buscar en la colección de alumnos.' });
                });
        } else {
            // Si el token no existe en la base de datos, devolver un error
            res.status(401).json({ error: 'Token no válido' });
        }
    } catch (err) {
        //console.error('Error al obtener alumnos:', err);
        res.status(500).json({ error: 'Error al obtener alumnos.' });
    }
});



/**
 * @swagger
 * /alumnos/{matricula}:
 *   get:
 *     summary: Obtiene un alumno por matrícula.
 *     description: Endpoint para obtener un alumno por su matrícula.
 *     parameters:
 *       - in: path
 *         name: matricula
 *         description: Matrícula del alumno a buscar.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         description: Token de autenticación del usuario.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: remember_token
 *         description: Token de autenticación del usuario.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alumno encontrado correctamente.
 *       404:
 *         description: Alumno no encontrado.
 *       401:
 *         description: Token no válido.
 *       500:
 *         description: Error al obtener el alumno.
 */
router.get("/alumnos/:matricula", async (req, res) => {
    // Obtener el token enviado por el usuario desde los parámetros de consulta en la URL
    const tokenFromUser = req.query.token;
    // Obtener la matrícula del alumno de los parámetros de ruta en la URL
    const matricula = req.params.matricula;

    const tokenRemember = req.query.remember_token;
    try {
        // Consultar la base de datos para verificar si existe un registro que coincida con ese token y el status sea igual a 1
        const tokenExists = await verifyTokenInDatabase(tokenFromUser);
        const rememberTokenExist = await alumnos.findOne({ remember_token: tokenRemember });
        if (tokenExists) {
            if (rememberTokenExist) {
                // Si el token existe en la base de datos y el rememberToken también existe, ejecutar el código para obtener el alumno por matrícula
                const alumno = await alumnos.findOne({ matricula: matricula });
                if (alumno) {
                    // Si se encontró el alumno, obtenemos la carrera asociada al alumno
                    const carrera = await carreras.findOne({ idCarrera: alumno.idCarrera });
                    if (carrera) {
                        // Si se encontró la carrera, enviar tanto el alumno como la información de la carrera como respuesta
                        res.status(200).json({ alumno: alumno, carrera: carrera });
                    } else {
                        // Si no se encontró la carrera, enviar un mensaje de error
                        res.status(404).json({ error: 'Carrera del alumno no encontrada' });
                    }
                } else {
                    // Si no se encontró el alumno, enviar un mensaje de error
                    res.status(404).json({ error: 'Alumno no encontrado' });
                }
            } else {
                // Si el token existe pero el rememberToken no existe, devolver un error
                res.status(401).json({ error: 'Token de recordatorio (remember_token) no válido' });
            }
        } else {
            // Si el token no existe en la base de datos, devolver un error
            res.status(401).json({ error: 'Token no válido' });
        }

    } catch (err) {
        console.error('Error al obtener alumno:', err);
        res.status(500).json({ error: 'Error al obtener alumno. ' });
    }
});
/**
 * @swagger
 * paths:
 *   /crear/alumno:
 *     post:
 *       summary: Crear un nuevo alumno
 *       description: |
 *         Esta ruta permite registrar un nuevo alumno en la base de datos.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   description: Nombre del alumno.
 *                 apellidos:
 *                   type: string
 *                   description: Apellidos del alumno.
 *                 matricula:
 *                   type: integer
 *                   description: Matrícula del alumno.
 *                 contraseña:
 *                   type: string
 *                   description: Contraseña del alumno.
 *                 telefono:
 *                   type: string
 *                   description: Número de teléfono del alumno.
 *                 correo:
 *                   type: string
 *                   description: Correo electrónico del alumno.
 *                 cuatrimestre:
 *                   type: integer
 *                   description: Número de cuatrimestre del alumno.
 *                 grupo:
 *                   type: string
 *                   description: Grupo al que pertenece el alumno.
 *                 idCarrera:
 *                   type: integer
 *                   description: ID de la carrera a la que pertenece el alumno.
 *                 matriculaTutor:
 *                   type: string
 *                   description: Matrícula del tutor del alumno.
 *       responses:
 *         '201':
 *           description: Alumno creado exitosamente
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Mensaje de éxito.
 *                   alumno:
 *                     $ref: '#/components/schemas/Alumno'
 *         '401':
 *           description: La matrícula ya se encuentra en el sistema
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Mensaje de error.
 *         '500':
 *           description: Error interno del servidor
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     description: Mensaje de error.
 * components:
 *   schemas:
 *     Alumno:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del alumno.
 *         apellidos:
 *           type: string
 *           description: Apellidos del alumno.
 *         matricula:
 *           type: integer
 *           description: Matrícula del alumno.
 *         contraseña:
 *           type: string
 *           description: Contraseña del alumno.
 *         telefono:
 *           type: string
 *           description: Número de teléfono del alumno.
 *         correo:
 *           type: string
 *           description: Correo electrónico del alumno.
 *         cuatrimestre:
 *           type: integer
 *           description: Número de cuatrimestre del alumno.
 *         grupo:
 *           type: string
 *           description: Grupo al que pertenece el alumno.
 *         idCarrera:
 *           type: integer
 *           description: ID de la carrera a la que pertenece el alumno.
 *         matriculaTutor:
 *           type: string
 *           description: Matrícula del tutor del alumno.
 */

router.post('/crear/alumno', async (req, res) => {
    try {
        const { nombre, apellidos, matricula, contraseña, telefono, correo, cuatrimestre, grupo, idCarrera, matriculaTutor } = req.body;
        const matriculaINT = +matricula;
        const telefonoINT = +telefono;
        const cuatrimestreINT = +cuatrimestre;
        const grupoINT = +grupo;
        const idCarreraaINT = +idCarrera;
        const matriculaTutorINT = +matriculaTutor;
        // Verificar si el alumno ya existe en la base de datos
        const alumnoExistente = await alumnos.findOne({ matricula: matriculaINT });
        console.log(contraseña);
        if (alumnoExistente) {
            res.status(401).json({ error: 'La matrícula ya se encuentra en el sistema' });
        } else {
            // Crear un nuevo alumno
            const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);
            console.log(contraseñaEncriptada);
            const nuevoAlumno = await alumnos.create({
                nombre,
                apellidos,
                'matricula': matriculaINT,
                'Contraseña': contraseñaEncriptada,
                'Telefono': telefonoINT,
                'Correo': correo,
                'Cuatrimestre': cuatrimestreINT,
                'Grupo': grupoINT,
                'activa': 2,
                'idRol': 1,
                'idCarrera': idCarreraaINT,
                'matriculaTutor': matriculaTutorINT
            });
            // Enviar respuesta con el alumno creado
            res.status(201).json({ message: 'Alumno creado exitosamente', alumno: nuevoAlumno });
        }
    } catch (error) {
        console.error('Error al crear el alumno:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

function hashPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}

/**
 * @swagger
 * /modificar/alumno/{matricula}:
 *   post:
 *     summary: Modificar los datos de un alumno.
 *     description: Modifica los datos de un alumno existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: matricula
 *         description: Matrícula del alumno a modificar.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del alumno.
 *               apellidos:
 *                 type: string
 *                 description: Nuevos apellidos del alumno.
 *               contraseña:
 *                 type: string
 *                 description: Nueva contraseña del alumno.
 *               telefono:
 *                 type: string
 *                 description: Nuevo número de teléfono del alumno.
 *               correo:
 *                 type: string
 *                 description: Nuevo correo electrónico del alumno.
 *               cuatrimestre:
 *                 type: integer
 *                 description: Nuevo número de cuatrimestre del alumno.
 *               grupo:
 *                 type: string
 *                 description: Nuevo grupo al que pertenece el alumno.
 *               idCarrera:
 *                 type: integer
 *                 description: Nuevo ID de la carrera a la que pertenece el alumno.
 *               matriculaTutor:
 *                 type: string
 *                 description: Nueva matrícula del tutor del alumno.
 *     responses:
 *       200:
 *         description: Datos del alumno modificados correctamente.
 *       404:
 *         description: El alumno no fue encontrado en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/modificar/alumno/:matricula', async (req, res) => {
    try {
        const matricula = req.params.matricula;
        const { nombre, apellidos, contraseña, telefono, correo, cuatrimestre, grupo, idCarrera, matriculaTutor } = req.body;

        // Verificar si el alumno existe en la base de datos
        const alumnoExistente = await alumnos.findOneAndUpdate(
            { matricula: matricula }, // Filtro
            {
                nombre,
                apellidos,
                contraseña,
                Telefono: telefono,
                correo,
                cuatrimestre,
                grupo,
                idCarrera,
                matriculaTutor
            }, // Datos a actualizar
            { new: true } // Opción para devolver el documento actualizado
        );
        console.log(alumnoExistente)
        if (!alumnoExistente) {
            res.status(404).json({ error: 'El alumno no fue encontrado en la base de datos' });
        } else {
            res.status(200).json({ message: 'Datos del alumno modificados correctamente' });
        }
    } catch (error) {
        console.error('Error al modificar el alumno:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @swagger
 * /conductores:
 *   get:
 *     summary: Obtener todos los conductores.
 *     description: Obtiene una lista de todos los conductores almacenados en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de conductores obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conductor'
 *       500:
 *         description: Error al obtener la lista de conductores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error interno del servidor al obtener la lista de conductores.
 * components:
 *   schemas:
 *     Conductor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del conductor.
 *         nombre:
 *           type: string
 *           description: Nombre del conductor.
 *         edad:
 *           type: integer
 *           description: Edad del conductor.
 *         licencia:
 *           type: string
 *           description: Número de licencia del conductor.
 *         vehiculo:
 *           type: object
 *           properties:
 *             marca:
 *               type: string
 *               description: Marca del vehículo del conductor.
 *             modelo:
 *               type: string
 *               description: Modelo del vehículo del conductor.
 */

router.get('/conductores', async (req, res) => {
    try {
        const conductores = await Conductores.find();
        res.status(200).json(conductores);
    } catch (error) {
        console.error('Error al obtener la lista de conductores:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener la lista de conductores' });
    }
});



// Función para verificar si un token existe en la base de datos y su status es igual a 1
async function verifyTokenInDatabase(key) {
    try {
        // Realizar la consulta en la base de datos para verificar si el token existe y su status es igual a 1
        const token = await apiKey.findOne({ apiKey: key });
        if (token === null) {
            return false; // Token no encontrado
        } else if (token.status === 1) {
            return true; // Token encontrado y su status es igual a 1
        } else if (token.status === 2) {
            return null; // Token encontrado pero su status es igual a 2
        }
    } catch (error) {
        console.error('Error al verificar el token en la base de datos:', error);
        throw error;
    }
}

module.exports = router;
