const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');
const { verifyToken, isAdmin } = require('../../../postgrest/src/middleware/auth.middleware');
// Importa los middlewares de seguridad


// La ruta ahora está protegida. Primero verifica el token, luego si es admin.
router.get('/', verifyToken, isAdmin, getLogs);

module.exports = router;