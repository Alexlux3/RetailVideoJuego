const pool = require('../config/database');

const getAllPlataformas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM plataformas WHERE activo = true ORDER BY nombre ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener plataformas", error: error.message });
    }
};

module.exports = { getAllPlataformas };