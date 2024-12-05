const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const alumnos = require("../../Models/alumnos");
const apiKey = require("../../Models/apikey");
const ConductorAutobus = require("../../Models/conductor");
const bcrypt = require('bcrypt');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Inicia sesión de un usuario y devuelve el perfil del alumno si las credenciales son válidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matricula:
 *                 type: string
 *                 description: La matrícula del alumno.
 *               password:
 *                 type: string
 *                 description: La contraseña del alumno.
 *               apiKey:
 *                 type: string
 *                 description: La clave de API para autenticar la solicitud.
 *     responses:
 *       '200':
 *         description: Perfil del alumno obtenido correctamente.
 *       '401':
 *         description: Credenciales o token inválidos.
 *       '404':
 *         description: Alumno no encontrado.
 *       '500':
 *         description: Error al autenticar al usuario.
 */
router.post("/login", async (req, res) => {
    const { matricula, password, apiKey } = req.body;

    try {
        const tokenExists = await verifyTokenInDatabase(apiKey);
        // Ruta completa donde se guardará el código QR
        // Genera un nombre único para el archivo del código QR
        const timestamp = Date.now(); // Obtiene el timestamp actual
        
        if (tokenExists) {
            const qrFilename = `codigoQR_${matricula}.png`; // Genera el nombre del archivo

            // Ruta completa donde se guardará el código QR
            const qrPath = path.join(__dirname, '..','..','..','assets', 'QRs', qrFilename);

            // Buscar en la colección de alumnos
            const alumno = await alumnos.findOne({
                where: {
                    matricula: matricula
                }
            });
            
            if (alumno) {
                const passwordCheck = await verifyPassword(password, alumno['contraseña']); // Accede al campo usando corchetes
                if (passwordCheck.success) {
                    const newToken = generateToken(matricula);
                    const updated = await updateRememberToken(matricula, newToken);
                    // Crea el código QR como una instancia de qr.image
                    
                    
                    const qrCode = qr.image(updated.updatedAlumno.matricula, { type: 'png' });
                    if (updated.success) {
                        res.status(200).json({ success: updated.updatedAlumno });
                        // Guarda el código QR en un archivo
                        qrCode.pipe(fs.createWriteStream(qrPath));
                    } else {
                        res.status(500).json({ error: 'Error al actualizar el token' });
                    }
                    return; // Finaliza la función
                } else {
                    res.status(401).json({ error: 'Contraseña incorrecta' });
                    return; // Finaliza la función
                }
            }

            // Buscar en la colección de conductores
            const conductor = await ConductorAutobus.findOne({ matricula: matricula });
            if (conductor) {
                const passwordCheck = await verifyPassword(password, conductor.password);
                //console.log(passwordCheck.success);
                
                if (passwordCheck.success) {
                    const newToken = generateToken(matricula);
                    const updated = await updateRememberToken(matricula, newToken);
                    if (updated.success) {
                        res.status(200).json({ success: updated.updatedConductor });
                    } else {
                        res.status(500).json({ error: 'Error al actualizar el token' });
                    }
                    return; // Finaliza la función
                } else {
                    res.status(401).json({ error: 'Contraseña incorrecta' });
                    return; // Finaliza la función
                }
            }
            // Si no se encontró ni alumno ni conductor
            res.status(404).json({ error: 'Usuario no encontrado' });
        } else {
            res.status(401).json({ error: 'Credenciales o token inválidos' });
        }
    } catch (error) {
        console.error('Error al autenticar al usuario:', error);
        res.status(500).json({ error: 'Error al autenticar al usuario.' });
    }
});


// Función para verificar la contraseña
async function verifyPassword(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        //console.log(match)
        return { success: match };
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        return { error: 'Error al verificar la contraseña' };
    }
}


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión de un usuario y elimina el token de recordatorio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remember_token:
 *                 type: string
 *                 description: El token de recordatorio de sesión del alumno.
 *               apiKey:
 *                 type: string
 *                 description: La clave de API para autenticar la solicitud.
 *     responses:
 *       '200':
 *         description: Sesión cerrada correctamente.
 *       '401':
 *         description: Token inválido.
 *       '500':
 *         description: Error al cerrar sesión.
 */
router.post("/logout", async (req, res) => {
    const { remember_token } = req.body;
    const { apiKey } = req.body;
    //console.log(req.body)
    try {
        const tokenExists = await verifyTokenInDatabase(apiKey);
        //console.log(tokenExists)
        if (tokenExists) {
            const deleted = await deleteRememberToken(remember_token);
            console.log(deleted)
            if (deleted) {
                res.status(200).json({ message: 'Sesión cerrada correctamente.' });
            } else {
                res.status(500).json({ error: 'Error al cerrar sesión.' });
            }
        } else {
            res.status(401).json({ error: 'Token inválido.' });
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ error: 'Error al cerrar sesión.' });
    }
});

function generateToken(matricula) {
    const payload = {
        matricula: matricula,
    };
    const secretCrypto = crypto.randomBytes(32).toString('hex');
    // Aquí se utiliza un secreto para firmar el token. Debes almacenar este secreto de forma segura.
    const secret = secretCrypto;

    const token = jwt.sign(payload, secret);

    return token;
}

async function updateRememberToken(matricula, token) {
    
    try {
        // Intenta actualizar el remember_token de un alumno
        const updateAlumno = await alumnos.update(
            { remember_token: token }, // Datos a actualizar
            { where: { matricula } }  // Condición
        );        

        // Si se modificó algún registro, entonces se encontró un alumno y se actualizó su token
        if (updateAlumno > 0) {
            const updatedAlumno = await alumnos.findOne({ matricula: matricula });
            return { success: true, updatedAlumno };
        } else {
            // Si no se encontró ningún alumno, entonces intenta actualizar el remember_token de un conductor
            const updateConductor = await ConductorAutobus.update(
                { remember_token: token },
                { where: { matricula } }
            );

            // Si se modificó algún registro, entonces se encontró un conductor y se actualizó su token
            if (updateConductor > 0) {
                const updatedConductor = await ConductorAutobus.findOne({ matricula: matricula });
                return { success: true, updatedConductor };
            } else {
                // Si no se encontró ningún conductor, entonces no se pudo actualizar ningún usuario
                return { success: false, error: 'No se encontró ningún usuario para actualizar.' };
            }
        }
    } catch (error) {
        console.error('Error al actualizar el token en la base de datos:', error);
        throw error;
    }
}

// async function deleteRememberToken(token) {
//     console.log(token);
//     try {
//         const update = await alumnos.updateOne(
//             { remember_token: token },
//             { $unset: { remember_token: "" }, $set: { deviceA_token: null } }
//         );
//         console.log(update);
//         return true;
//     } catch (error) {
//         console.error('Error al eliminar el token en la base de datos:', error);
//         throw error;
//     }
// }

async function deleteRememberToken(token) {
    console.log(token);

    try {
        // Intenta eliminar el remember_token de un alumno
        const updateAlumno = await alumnos.update(
            { 
                remember_token: null, // Actualiza remember_token a null
                deviceA_token: null // Actualiza deviceA_token a null
            },
            { 
                where: { remember_token: token } // Condición para encontrar el alumno
            }
        );

        // Si se modificó algún registro, entonces se encontró un alumno y se cerró su sesión
        if (updateAlumno[0] > 0) {
            return true;
        } else {
            // Si no se encontró ningún alumno, intenta eliminar el remember_token de un conductor
            const updateConductor = await ConductorAutobus.update(
                { 
                    remember_token: null, // Actualiza remember_token a null
                    deviceA_token: null // Actualiza deviceA_token a null
                },
                { 
                    where: { remember_token: token } // Condición para encontrar el conductor
                }
            );

            // Si se modificó algún registro, entonces se encontró un conductor y se cerró su sesión
            if (updateConductor[0] > 0) {
                return true;
            } else {
                // Si no se encontró ningún conductor, entonces no hay usuario asociado a este token
                return false;
            }
        }
    } catch (error) {
        console.error('Error al eliminar el token en la base de datos:', error);
        throw error;
    }
}



async function deletedDeviceToken(deviceA_token) {
    const device = await alumnos.update({ remember_token: token }, { $unset: { deviceA_token: "" } });
}

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
