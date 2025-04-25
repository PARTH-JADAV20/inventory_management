const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const { validateSale } = require('../middleware/validationMiddleware');
const {
  createSale,
  getSales,
  deleteSale
} = require('../controllers/salesController');

// Apply shop validation middleware
router.use(validateShop);

router.route('/')
  .get(getSales)
  .post(validateSale, createSale);

router.route('/:billNo')
  .delete(deleteSale);

module.exports = router;