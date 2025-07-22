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

// Ruta para OBTENER PROVEEDORES
router.get('/proveedores', async (req, res) => {
    const authHeader = req.headers['authorization'];
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/proveedores`, {
            headers: { 'Authorization': authHeader }
        });
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({ message: "No se pudo conectar al servicio de proveedores." });
    }
});

// =================================================================
// RUTA FALTANTE PARA REGISTRAR COMPRAS - AÑADIDA AQUÍ
// =================================================================
router.post('/compras', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const datosCompra = req.body; // Obtenemos los datos que envía el frontend

    console.log("✅ Backend: Petición recibida en POST /api/admin/compras");

    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/compras`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCompra) // Enviamos los datos a la Máquina 1
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const resultado = await response.json();
        res.status(response.status).json(resultado);
    } catch (error) {
        console.error("❌ Backend Error en /compras:", error);
        res.status(500).json({ message: "No se pudo conectar al servicio de compras." });
    }
});

// =================================================================
// NUEVA RUTA PARA INICIAR EL BACKUP
// =================================================================
router.post('/backup', async (req, res) => {
    const authHeader = req.headers['authorization'];
    try {
        // CORRECCIÓN: La ruta correcta en el backend del Estudiante 1 es /api/admin/backup
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/admin/backup`, {
            method: 'POST',
            headers: { 'Authorization': authHeader }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de backup." });
    }
});



module.exports = router;