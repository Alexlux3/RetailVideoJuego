const { Router } = require('express');
const router = Router();
const { getLogs } = require('../controllers/log.controller');

router.get('/', getLogs);

module.exports = router;
