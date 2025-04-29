const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const { validateStock, validateStockDelete } = require('../middleware/validationMiddleware');
const {
  getStock,
  addStock,
  updateStock,
  deleteStock
} = require('../controllers/stockController');

// Apply shop validation middleware
router.use(validateShop);

router.route('/')
  .get(getStock)
  .post(validateStock, addStock)

router.route('/:id')
  .put(validateStock, updateStock)
  .delete(validateStockDelete, deleteStock)

module.exports = router;