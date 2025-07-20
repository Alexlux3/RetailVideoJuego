const { getDb } = require('../config/mongo');

const getReports = async (req, res) => {
  try {
    const db = getDb();

    // Ejemplo: Contar cantidad de logs por nivel
    const aggregation = await db.collection('logs_sistema').aggregate([
      { $group: { _id: "$nivel", total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();

    res.status(200).json({ report: aggregation });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
  }
};

module.exports = { getReports };
