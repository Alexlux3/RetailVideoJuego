const { Router } = require('express');
const router = Router();
const { manualBackup } = require('../controllers/admin.controller');


const isAdmin = (req, res, next) => {
  
  console.log('Verificando si el usuario es admin... (Simulación: Permitido)');
  req.user = { id: 1, rol: 'admin' }; 
  next();
};

router.post('/backup', isAdmin, manualBackup);

module.exports = router;