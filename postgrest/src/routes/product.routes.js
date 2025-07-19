const { Router } = require('express');
const router = Router();

// Importamos el controlador de productos
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

// Definimos las rutas y el método HTTP asociado
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Exportamos el router
module.exports = router;