const { Router } = require('express');
const router = Router();
const { loginUser, registerUser } = require('../controllers/user.controller');

router.post('/login', loginUser);
router.post('/registro', registerUser);

module.exports = router;
