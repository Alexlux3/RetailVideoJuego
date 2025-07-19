const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100'; // IP de Tailscale del Estudiante 1

// Ruta para el Login
router.post('/login', async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios/login`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de autenticación." });
    }
});

// NUEVA RUTA para el Registro
router.post('/registro', async (req, res) => {
    try {
        // Asumimos que el endpoint del Estudiante 1 es '/api/usuarios/registro'
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios/registro`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de registro." });
    }
});

module.exports = router;