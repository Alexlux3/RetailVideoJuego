const { Router } = require('express');
const router = Router();

// Aquí irían las funciones del controlador de ventas
// const { createSale } = require('../controllers/sale.controller');

// Ruta de ejemplo
router.post('/', (req, res) => {
    res.send('Ruta de ventas funcionando');
});

// Exportar el router
module.exports = router;