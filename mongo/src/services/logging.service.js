// src/services/logging.service.js

const { getDb } = require('../config/mongo');

/**
 * Registra una acción en la colección de logs.
 * @param {object} logData - Datos del log a registrar.
 */
const logAction = async (logData) => {
  try {
    const db = getDb();
    const logsCollection = db.collection('logs_sistema');
    
    // Añade la fecha y hora actual al objeto de log
    const fullLogData = {
      ...logData,
      timestamp: new Date(),
    };

    await logsCollection.insertOne(fullLogData);
  } catch (error) {
    // Se imprime el error en consola para no detener la aplicación principal
    console.error('Error al guardar el log:', error);
  }
};

module.exports = { logAction };