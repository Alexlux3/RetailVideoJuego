const { Router } = require('express');
const router = Router();
const { manualBackup } = require('../controllers/admin.controller');

// Middleware de ejemplo para proteger la ruta
const isAdmin = (req, res, next) => {
  // En un sistema real, aquí se verifica un token o sesión.
  console.log('Verificando si el usuario es admin... (Simulación: Permitido)');
  req.user = { id: 1, rol: 'admin' }; 
  next();
};

router.post('/backup', isAdmin, manualBackup);

module.exports = router;