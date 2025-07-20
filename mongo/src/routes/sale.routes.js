const { Router } = require('express');
const router = Router();
const { postSaleRemote } = require('../controllers/sale.controller');

// Ruta POST para registrar venta (Estudiante 3 -> Estudiante 2)
router.post('/', postSaleRemote);

module.exports = router;

