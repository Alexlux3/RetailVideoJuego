const { Router } = require('express');
const router = Router();
const { getAllCategorias } = require('../controllers/categoria.controller');

router.get('/', getAllCategorias);

module.exports = router;