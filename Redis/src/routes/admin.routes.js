const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100'; // IP de Tailscale del Estudiante 1

// Ruta para OBTENER todos los usuarios
router.get('/usuarios', async (req, res) => {
    const authHeader = req.headers['authorization'];
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios`, {
            headers: { 'Authorization': authHeader }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de usuarios." });
    }
});

// Ruta para ELIMINAR un usuario por ID
router.delete('/usuarios/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const { id } = req.params;
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authHeader }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de usuarios." });
    }
});

module.exports = router;