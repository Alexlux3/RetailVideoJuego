const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');
// Importa los middlewares de seguridad
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// La ruta ahora está protegida. Primero verifica el token, luego si es admin.
<<<<<<< HEAD
router.get('/', getLogs);
=======
router.get('/', verifyToken, isAdmin, getLogs);
>>>>>>> 54526e80f01f72358eb5f30c00ecb8ad53d106e7

module.exports = router;