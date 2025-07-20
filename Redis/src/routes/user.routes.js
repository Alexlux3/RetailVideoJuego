const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100';

// Ruta para el Login
router.post('/login', async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/auth/login`, {
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

// Ruta para el Registro con Debugs
router.post('/registro', async (req, res) => {
    // --- DEBUG 3 ---
    console.log("\nPaso 2 (Servidor Intermediario): Petición de registro recibida.", { body: req.body });
    
    try {
        // --- DEBUG 4 ---
        console.log(`Paso 3 (Servidor Intermediario): Enviando petición a Estudiante 1 en ${IP_ESTUDIANTE_1} a la ruta /api/usuarios...`);

        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/usuarios`, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        // --- DEBUG 5 ---
        console.log("Paso 5 (Servidor Intermediario): Respuesta recibida de Estudiante 1.", { status: response.status, data });
        
        res.status(response.status).json(data);
    } catch (error) {
        // --- DEBUG X ---
        console.error("Paso X (Servidor Intermediario): ¡FALLÓ LA CONEXIÓN con el servidor del Estudiante 1!", error);
        res.status(500).json({ message: "No se pudo conectar al servicio de registro." });
    }
});

module.exports = router;