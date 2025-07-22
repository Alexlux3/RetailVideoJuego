const { Router } = require('express');
const router = Router();
const { triggerBackup } = require('../controllers/internalBackup.controller');

router.post('/', triggerBackup);

module.exports = router;