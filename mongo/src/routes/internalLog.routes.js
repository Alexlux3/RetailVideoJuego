const { Router } = require('express');
const router = Router();
const { receiveLog } = require('../controllers/internalLog.controller');

// Este endpoint no necesita seguridad porque se asume que solo será llamado
// desde el otro backend en la misma red.
router.post('/', receiveLog);

module.exports = router;