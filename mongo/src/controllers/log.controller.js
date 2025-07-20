const { getDb } = require('../config/mongo');

const getLogs = async (req, res) => {
  try {
    const db = getDb();
    const { modulo, usuario_id, nivel } = req.query;

    const filter = {};
    if (modulo) filter.modulo = modulo;
    if (usuario_id) filter.usuario_id = parseInt(usuario_id, 10);
    if (nivel) filter.nivel = nivel;

    const logs = await db.collection('logs_sistema')
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los logs', error: error.message });
  }
};

module.exports = { getLogs };

