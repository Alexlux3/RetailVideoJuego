// src/routes/report.routes.js

const { Router } = require('express');
const router = Router();
const { getVentasPorCategoria } = require('../controllers/report.controller');

// La URL será: GET /api/reports/ventas-por-categoria
router.get('/ventas-por-categoria', getVentasPorCategoria);

// ESTA LÍNEA ES CRUCIAL. Sin ella, el archivo no exporta nada.
module.exports = router;