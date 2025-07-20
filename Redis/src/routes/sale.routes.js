const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100'; // IP de Tailscale del Estudiante 1

router.post('/', async (req, res) => {
    try {
        // Obtenemos el header de autorización que nos envía el script.js
        const authHeader = req.headers['authorization'];

        // Lo reenviamos en la nueva petición al servidor principal
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/ventas`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader // Reenviamos el header completo con el token
            }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Error al contactar el servicio de ventas:", error);
        res.status(500).json({ message: "No se pudo conectar al servicio de ventas." });
    }
});

module.exports = router;