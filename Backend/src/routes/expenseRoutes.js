const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const { validateExpense, validateExpenseFilter } = require('../middleware/validationMiddleware');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

// Apply shop validation middleware
router.use(validateShop);

router.route('/')
  .get(validateExpenseFilter, getExpenses)
  .post(validateExpense, addExpense);

router.route('/:id')
  .put(validateExpense, updateExpense)
  .delete(deleteExpense);

module.exports = router;