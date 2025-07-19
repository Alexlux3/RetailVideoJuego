const { Router } = require('express');
const router = Router();
const { getAllPlataformas } = require('../controllers/plataforma.controller');

router.get('/', getAllPlataformas);

module.exports = router;