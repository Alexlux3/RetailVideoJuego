const pool = require('../config/database');
const bcrypt = require('bcrypt');
// Importa el nuevo servicio para enviar logs al servidor de MongoDB
const { sendLog } = require('../services/apiLogger.service');

const createUser = async (req, res) => {
    const { nombre_completo, email, password, telefono, nombre_usuario } = req.body;
    if (!password) {
        return res.status(400).json({ message: "La contraseña es requerida." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // PASO 1: Crear el registro en la tabla 'usuarios'
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const rol = 'usuario'; // Se asigna el rol 'usuario' por defecto

        const userResult = await client.query(
            `INSERT INTO usuarios (nombre_completo, email, password_hash, telefono, nombre_usuario, rol)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_usuario, nombre_completo, email, rol`,
            [nombre_completo, email, password_hash, telefono, nombre_usuario, rol]
        );
        const newUser = userResult.rows[0];

        // PASO 2: Crear el registro correspondiente en la tabla 'clientes'
        const nombreParts = nombre_completo.split(' ');
        const nombre = nombreParts[0] || '';
        const apellido = nombreParts.slice(1).join(' ') || '';

        await client.query(
            `INSERT INTO clientes (nombre, apellido, email, telefono, id_usuario)
             VALUES ($1, $2, $3, $4, $5)`,
            [nombre, apellido, email, telefono, newUser.id_usuario]
        );

        await client.query('COMMIT'); // Se confirma la transacción en PostgreSQL

        // --- INICIO DE LA INTEGRACIÓN (HOOK DE API) ---
        sendLog({
            nivel: 'info',
            modulo: 'usuarios',
            accion: 'registro',
            usuario_id: newUser.id_usuario,
            mensaje: `Se ha registrado un nuevo usuario: ${newUser.nombre_completo} (${newUser.email})`,
            datos_nuevos: { id: newUser.id_usuario, nombre: newUser.nombre_completo, rol: newUser.rol }
        });
        // --- FIN DE LA INTEGRACIÓN ---

        res.status(201).json({ message: "Usuario y perfil de cliente creados exitosamente", user: newUser });

    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            return res.status(409).json({ message: "El email o nombre de usuario ya está registrado." });
        }
        console.error("Error en la transacción de createUser:", error);
        res.status(500).json({ message: "Error interno al crear el usuario", error: error.message });
    } finally {
        client.release();
    }
};

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id_usuario, nombre_usuario, email, rol, nombre_completo FROM usuarios ORDER BY id_usuario ASC'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const adminUserId = req.user.id; // ID del admin que realiza la acción, obtenido del token

    try {
        // Obtener datos del usuario ANTES de desactivarlo para tener un log completo
        const userResult = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userToDelete = userResult.rows[0];

        // Desactivar el usuario
        await pool.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [id]);

        // --- INICIO DE LA INTEGRACIÓN (HOOK DE API) ---
        sendLog({
            nivel: 'warn', // Desactivar es una acción de advertencia
            modulo: 'usuarios',
            accion: 'desactivar',
            usuario_id: adminUserId, // El admin que ejecutó la acción
            mensaje: `El administrador (ID: ${adminUserId}) ha desactivado al usuario ${userToDelete.nombre_completo} (ID: ${id})`,
            datos_anteriores: { id: userToDelete.id_usuario, nombre: userToDelete.nombre_completo, activo: userToDelete.activo }
        });
        // --- FIN DE LA INTEGRACIÓN ---

        res.status(200).json({ message: `Usuario con ID ${id} desactivado.` });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario." });
    }
};

module.exports = { createUser, getAllUsers, deleteUser };