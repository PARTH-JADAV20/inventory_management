const asyncHandler = require('express-async-handler');
const { getExpenseModel } = require('../models/Expense');

// Get all expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { startDate, endDate, month, paidTo, category } = req.query;
  
  const Expense = getExpenseModel(shop);
  
  // Build query based on filters
  let query = {};
  
  if (startDate && endDate) {
    // Filter by date range
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (month) {
    // Filter by month (format: yyyy-MM)
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  if (paidTo) {
    query.paidTo = { $regex: paidTo, $options: 'i' };
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  
  // Fetch expenses
  const expenses = await Expense.find(query).sort({ date: -1 });
  
  // Calculate totals
  const totals = expenses.reduce((acc, expense) => {
    acc.totalAmount += expense.amount;
    acc.count += 1;
    return acc;
  }, { totalAmount: 0, count: 0 });
  
  res.status(200).json({
    expenses,
    summary: {
      totalAmount: totals.totalAmount,
      count: totals.count
    }
  });
});

// Add new expense
const addExpense = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { date, category, expenseDescription, amount, paidTo, paymentMode } = req.body;
  
  const Expense = getExpenseModel(shop);
  
  // Validate amount
  if (amount <= 0) {
    res.status(400);
    throw new Error('Amount must be positive');
  }
  
  // Generate unique ID
  const maxIdExpense = await Expense.findOne().sort({ id: -1 });
  const newId = maxIdExpense ? maxIdExpense.id + 1 : 1;
  
  // Create expense
  const expense = await Expense.create({
    id: newId,
    date: new Date(date),
    category,
    expenseDescription: expenseDescription || '',
    amount,
    paidTo,
    paymentMode
  });
  
  res.status(201).json(expense);
});

// Update expense
const updateExpense = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  const updateData = req.body;
  
  const Expense = getExpenseModel(shop);
  
  // Find and update expense
  const expense = await Expense.findOneAndUpdate(
    { id: Number(id) },
    updateData,
    { new: true }
  );
  
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  
  res.status(200).json(expense);
});

// Delete expense
const deleteExpense = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  
  const Expense = getExpenseModel(shop);
  
  // Find and delete expense
  const expense = await Expense.findOneAndDelete({ id: Number(id) });
  
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  
  res.status(200).json({ message: 'Expense deleted' });
});

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
};