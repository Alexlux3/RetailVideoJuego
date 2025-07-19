const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { nombre_completo, email, password, telefono, nombre_usuario } = req.body;
    if (!password) return res.status(400).json({ message: "La contraseña es requerida." });

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const rol = 'usuario';

        const result = await pool.query(
            `INSERT INTO usuarios (nombre_completo, email, password_hash, telefono, nombre_usuario, rol)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_usuario, nombre_completo, email, rol`,
            [nombre_completo, email, password_hash, telefono, nombre_usuario, rol]
        );
        res.status(201).json({ message: "Usuario creado exitosamente", user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ message: "El email o nombre de usuario ya existe." });
        res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
};

const deleteMyAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [userId]);
        res.status(200).json({ message: "Tu cuenta ha sido desactivada." });
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la cuenta", error: error.message });
    }
};

module.exports = { createUser, deleteMyAccount };