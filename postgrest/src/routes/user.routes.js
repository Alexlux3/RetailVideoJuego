const { Router } = require('express');
const router = Router();
const { createUser, deleteMyAccount } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');


// La petición POST a '/api/usuarios' entrará aquí
router.post('/', createUser);

router.delete('/me', verifyToken, deleteMyAccount);

module.exports = router;