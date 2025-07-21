const fetch = require('node-fetch');

// El Estudiante 2 debe estar corriendo su servidor en el puerto 3001
const MONGO_SERVER_URL = 'http://100.85.94.86:5000/internal/log';

/**
 * Envía un objeto de log al servidor de MongoDB para ser registrado.
 * @param {object} logData - El objeto con la información del log.
 */
const sendLog = async (logData) => {
    try {
        await fetch(MONGO_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        console.log("Log enviado exitosamente al servicio de auditoría.");
    } catch (error) {
        // Es importante solo registrar el error en la consola y no detener la operación principal.
        // La venta o el registro de usuario es más importante que su log.
        console.error("Error: No se pudo conectar con el servicio de auditoría.", error.message);
    }
};

module.exports = { sendLog };