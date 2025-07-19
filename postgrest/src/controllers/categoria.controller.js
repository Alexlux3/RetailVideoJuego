const pool = require('../config/database');

const getAllCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE activo = true ORDER BY nombre ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener categorías", error: error.message });
    }
};

module.exports = { getAllCategorias };