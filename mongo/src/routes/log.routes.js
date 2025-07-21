const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');

// La ruta ahora está protegida. Primero verifica el token, luego si es admin.
router.get('/', getLogs);

module.exports = router;