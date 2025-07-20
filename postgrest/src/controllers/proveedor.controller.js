const pool = require('../config/database');

// Función para obtener todos los proveedores activos
const getAllProveedores = async (req, res) => {
    try {
        const result = await pool.query('SELECT id_proveedor, nombre_empresa, contacto_principal, email, pais FROM proveedores WHERE activo = true ORDER BY nombre_empresa ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los proveedores", error: error.message });
    }
};

module.exports = { getAllProveedores };