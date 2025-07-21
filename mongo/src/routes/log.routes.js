const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');
// Importa los middlewares de seguridad
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// La ruta ahora está protegida. Primero verifica el token, luego si es admin.
router.get('/', verifyToken, isAdmin, getLogs);

module.exports = router;
