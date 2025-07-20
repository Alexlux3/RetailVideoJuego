const { Router } = require('express');
const router = Router();
const { getReports } = require('../controllers/report.controller');

router.get('/', getReports);

module.exports = router;
