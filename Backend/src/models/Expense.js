const mongoose = require('mongoose');

// Define schema for expense
const expenseSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  expenseDescription: { type: String, default: '' },
  amount: { type: Number, required: true },
  paidTo: { type: String, required: true },
  paymentMode: { type: String, required: true }
}, { timestamps: true });

// Create indexes for common queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ paidTo: 1 });
expenseSchema.index({ category: 1 });

// Create separate models for each shop
const Shop1Expense = mongoose.model('Shop1Expense', expenseSchema);
const Shop2Expense = mongoose.model('Shop2Expense', expenseSchema);

// Factory function to return the appropriate model based on shop
const getExpenseModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1Expense;
  } else if (shop === 'shop2') {
    return Shop2Expense;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getExpenseModel };