const { Router } = require('express');
const router = Router();
const { createUser, getAllUsers, deleteUser } = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Ruta pública para que cualquiera pueda registrarse
router.post('/', createUser);

// Ruta protegida para que solo un admin pueda obtener la lista de usuarios
router.get('/', verifyToken, isAdmin, getAllUsers);

// Ruta protegida para que solo un admin pueda eliminar un usuario
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;