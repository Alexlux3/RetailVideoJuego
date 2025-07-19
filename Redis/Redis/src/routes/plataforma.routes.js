const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');
const IP_ESTUDIANTE_1 = '100.91.20.100';

router.get('/', async (req, res) => {
    try {
        const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/plataformas`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "No se pudo conectar al servicio de plataformas." });
    }
});
module.exports = router;