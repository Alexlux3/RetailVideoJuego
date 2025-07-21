const { Router } = require('express');
const router = Router();
const { createPurchase } = require('../controllers/purchase.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- RUTA PARA REGISTRAR UNA NUEVA COMPRA ---
//
// Esta ruta está protegida por dos middlewares:
// 1. verifyToken: Asegura que el usuario haya iniciado sesión y tenga un token válido.
// 2. isAdmin: Asegura que el usuario que inició sesión tenga el rol de 'admin'.
//
// Si ambas verificaciones pasan, se ejecuta la función createPurchase.
router.post('/', verifyToken, isAdmin, createPurchase);

module.exports = router;