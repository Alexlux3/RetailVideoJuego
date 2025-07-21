const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendLog } = require('../services/apiLogger.service'); // Importar el servicio de logging

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // Opcional: Registrar intentos de login fallidos
            sendLog({
                nivel: 'warn',
                modulo: 'autenticacion',
                accion: 'login_fallido',
                mensaje: `Intento de login fallido para el email: ${email}`
            });
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol },
            'tu_secreto_super_secreto_para_jwt',
            { expiresIn: '8h' }
        );

        await pool.query('UPDATE usuarios SET fecha_ultimo_acceso = NOW() WHERE id_usuario = $1', [user.id_usuario]);

        // --- HOOK DE LOGGING ---
        // Se envía el log después de un inicio de sesión exitoso.
        sendLog({
            nivel: 'info',
            modulo: 'autenticacion',
            accion: 'login',
            usuario_id: user.id_usuario,
            mensaje: `El usuario ${user.nombre_completo} ha iniciado sesión.`
        });

        res.json({ token, user: { id: user.id_usuario, nombre: user.nombre_completo, username: user.nombre_usuario, rol: user.rol } });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor durante el login", error: error.message });
    }
};

module.exports = { login };