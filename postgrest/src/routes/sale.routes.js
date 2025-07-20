const { Router } = require('express');
const router = Router();
const { createSale } = require('../controllers/sale.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Ruta protegida: solo usuarios logueados (con token válido) pueden comprar.
// Define la ruta POST en la raíz ('/') y la asocia con la función createSale del controlador.
router.post('/', verifyToken, createSale);

module.exports = router;