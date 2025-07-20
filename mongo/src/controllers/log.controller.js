
const { getDb } = require('../config/mongo');

const getLogs = async (req, res) => {
  try {
    const db = getDb();
    // Filtros opcionales desde la URL (ej: /api/logs?modulo=productos)
    const { modulo, usuario_id, nivel } = req.query;
    
    const filter = {};
    if (modulo) filter.modulo = modulo;
    if (usuario_id) filter.usuario_id = parseInt(usuario_id, 10);
    if (nivel) filter.nivel = nivel;

    const logs = await db.collection('logs_sistema')
      .find(filter)
      .sort({ timestamp: -1 }) // Ordena por fecha, los más nuevos primero
      .limit(100) // Limita a los últimos 100 resultados para no sobrecargar
      .toArray();

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los logs', error: error.message });
  }
};

module.exports = { getLogs };