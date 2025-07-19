const { Router } = require('express');
const router = Router();
const { createSale } = require('../controllers/sale.controller');

router.post('/', createSale);

module.exports = router;