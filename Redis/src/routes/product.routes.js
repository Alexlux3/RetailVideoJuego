const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

const IP_ESTUDIANTE_1 = '100.91.20.100';

// Ruta para obtener TODOS los productos
router.get('/', async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/productos`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al catálogo de productos." });
    }
});

// Ruta para obtener UN SOLO producto por su ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/productos/${id}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: `No se pudo obtener el producto.` });
    }
});

module.exports = router;