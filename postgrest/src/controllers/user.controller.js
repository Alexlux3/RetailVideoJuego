const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { nombre_completo, email, password, telefono, nombre_usuario } = req.body;
    if (!password) {
        return res.status(400).json({ message: "La contraseña es requerida." });
    }

    // Obtenemos un cliente del pool para manejar la transacción
    const client = await pool.connect();

    try {
        // Inicia la transacción
        await client.query('BEGIN');

        // --- PASO 1: Crear el registro en la tabla 'usuarios' ---
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

        // --- PASO 2: Crear el registro correspondiente en la tabla 'clientes' ---
        // (Esto asume que ya ejecutaste el ALTER TABLE para añadir 'id_usuario' a 'clientes')
        const nombreParts = nombre_completo.split(' ');
        const nombre = nombreParts[0] || '';
        const apellido = nombreParts.slice(1).join(' ') || '';

        await client.query(
            `INSERT INTO clientes (nombre, apellido, email, telefono, id_usuario)
             VALUES ($1, $2, $3, $4, $5)`,
            [nombre, apellido, email, telefono, newUser.id_usuario]
        );

        // --- PASO 3: Si todo fue bien, se confirma la transacción ---
        await client.query('COMMIT');

        res.status(201).json({ message: "Usuario y perfil de cliente creados exitosamente", user: newUser });

    } catch (error) {
        // Si algo falla, se revierte toda la operación
        await client.query('ROLLBACK');

        if (error.code === '23505') { // Error de duplicado (email, username, etc.)
            return res.status(409).json({ message: "El email o nombre de usuario ya está registrado." });
        }
        
        console.error("Error en la transacción de createUser:", error);
        res.status(500).json({ message: "Error interno al crear el usuario", error: error.message });
    } finally {
        // Se libera la conexión del cliente, devolviéndolo al pool
        client.release();
    }
};

const deleteMyAccount = async (req, res) => {
    // Esta función requiere un middleware de autenticación para obtener req.user.id
    const userId = req.user.id; 
    try {
        // Es un "soft delete", solo se desactiva
        await pool.query('UPDATE usuarios SET activo = false WHERE id_usuario = $1', [userId]);
        // También podrías desactivar el cliente si quisieras
        // await pool.query('UPDATE clientes SET activo = false WHERE id_usuario = $1', [userId]);
        res.status(200).json({ message: "Tu cuenta ha sido desactivada." });
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la cuenta", error: error.message });
    }
};

module.exports = { createUser, deleteMyAccount };