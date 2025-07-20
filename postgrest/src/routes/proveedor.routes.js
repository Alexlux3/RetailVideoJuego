const { Router } = require('express');
const router = Router();
const { getAllProveedores } = require('../controllers/proveedor.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Ruta protegida: solo un admin logueado puede ver la lista de proveedores
router.get('/', verifyToken, isAdmin, getAllProveedores);

module.exports = router;