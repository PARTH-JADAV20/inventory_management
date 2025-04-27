const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const { validateCreditSale } = require('../middleware/validationMiddleware');
const {
  createCreditSale,
  getCreditSales,
  getCreditSaleById,
  updateCreditSaleStatus,
  getPendingCredits
} = require('../controllers/creditSaleController');

// Apply shop validation middleware
router.use(validateShop);

router.route('/')
  .get(getCreditSales)
  .post(validateCreditSale, createCreditSale);

router.route('/pending')
  .get(getPendingCredits);

router.route('/:id')
  .get(getCreditSaleById)
  .put(updateCreditSaleStatus);

module.exports = router;