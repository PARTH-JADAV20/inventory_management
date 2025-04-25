const mongoose = require('mongoose');

// Define schema for a single profile
const billSchema = new mongoose.Schema({
  billNo: { type: String, required: true },
  date: { type: String, required: true }, // DD-MM-YYYY format
  items: [{
    product: { type: String, required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    pricePerQty: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  advanceRemaining: { type: Number, default: null },
  creditAmount: { type: Number, default: null },
  paymentMethod: { type: String, required: true }
}, { _id: false });

// Define schema for advance transaction
const advanceTransactionSchema = new mongoose.Schema({
  transactionType: { type: String, required: true, enum: ['Deposit', 'Refund'] },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
}, { _id: false });

// Define schema for a single profile
const profileSchema = new mongoose.Schema({
  profileId: { type: String, required: true },
  name: { type: String, required: true },
  advance: {
    value: { type: Boolean, default: false },
    currentamount: { type: Number, default: 0 },
    showinadvance: { type: Boolean, default: true },
    paymentMethod: { type: String, default: 'Cash' }
  },
  advanceHistory: [advanceTransactionSchema],
  bills: [billSchema],
  credit: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  deleteuser: {
    value: { type: Boolean, default: false },
    date: { type: String, default: '' }
  }
}, { _id: false });

// Define schema for customer
const customerSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  profiles: [profileSchema]
}, { timestamps: true });

// Create separate models for each shop
const Shop1Customer = mongoose.model('Shop1Customer', customerSchema);
const Shop2Customer = mongoose.model('Shop2Customer', customerSchema);

// Factory function to return the appropriate model based on shop
const getCustomerModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1Customer;
  } else if (shop === 'shop2') {
    return Shop2Customer;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getCustomerModel };