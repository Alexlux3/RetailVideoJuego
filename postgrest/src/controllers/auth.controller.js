const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar al usuario por email
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const user = userResult.rows[0];

        // Comparar la contraseña enviada con la hasheada en la BD
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Si las credenciales son correctas, crear un token
        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol },
            'tu_secreto_super_secreto_para_jwt', // ¡Usa una variable de entorno en un proyecto real!
            { expiresIn: '1h' }
        );

        // Actualizar la fecha de último acceso
        await pool.query('UPDATE usuarios SET fecha_ultimo_acceso = NOW() WHERE id_usuario = $1', [user.id_usuario]);

        res.json({ token, user: { id: user.id_usuario, nombre: user.nombre_completo, username: user.nombre_usuario, rol: user.rol } });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor durante el login", error: error.message });
    }
};

module.exports = { login };