const { logAction } = require('../services/logging.service');

const receiveLog = async (req, res) => {
    try {
        // El cuerpo de la petición contendrá los datos del log
        const logData = req.body;
        
        // Usamos el servicio de logging que ya tienes para guardar en MongoDB
        await logAction(logData);

        res.status(200).json({ message: "Log recibido y guardado exitosamente." });
    } catch (error) {
        console.error("Error al recibir el log:", error);
        res.status(500).json({ message: "Error interno al procesar el log." });
    }
};

module.exports = { receiveLog };