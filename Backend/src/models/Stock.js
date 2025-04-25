const mongoose = require('mongoose');

// Define schema for stock
const stockSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  addedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for common queries
stockSchema.index({ name: 1, category: 1, unit: 1 });
stockSchema.index({ addedDate: -1 });

// Create separate models for each shop
const Shop1Stock = mongoose.model('Shop1Stock', stockSchema);
const Shop2Stock = mongoose.model('Shop2Stock', stockSchema);

// Factory function to return the appropriate model based on shop
const getStockModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1Stock;
  } else if (shop === 'shop2') {
    return Shop2Stock;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getStockModel };