const { Router } = require('express');
const router = Router();
const { createUser, deleteMyAccount } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // Lo crearemos en el siguiente paso

router.post('/', createUser); // Ruta para registrarse
router.delete('/me', verifyToken, deleteMyAccount); // Ruta para eliminar mi cuenta

module.exports = router;