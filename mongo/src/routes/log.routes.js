
const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');

// La ruta GET /api/logs/ ejecutará la función getLogs
router.get('/', getLogs);

module.exports = router;