const { Router } = require('express');
const router = Router();
const { getVentasPorFecha, getStockBajo, getMasVendidos } = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Todas las rutas de reportes requieren que el usuario esté logueado (verifyToken)
// y que tenga el rol de 'admin' (isAdmin).

// Ruta para obtener ventas por fecha. Ejemplo: /api/reports/ventas-por-fecha?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
router.get('/ventas-por-fecha', verifyToken, isAdmin, getVentasPorFecha);

// Ruta para obtener productos con stock bajo
router.get('/stock-bajo', verifyToken, isAdmin, getStockBajo);

// Ruta para obtener los productos más vendidos
router.get('/mas-vendidos', verifyToken, isAdmin, getMasVendidos);

module.exports = router;