const mongoose = require('mongoose');

const billNumberSchema = new mongoose.Schema({
  prefix: {
    type: String,
    default: 'B',
    required: true
  },
  lastNumber: {
    type: Number,
    default: 100,
    required: true
  },
  shop: {
    type: String,
    required: true,
    enum: ['shop1', 'shop2']
  }
}, { timestamps: true });

// Create separate models for each shop
const Shop1BillNumber = mongoose.model('Shop1BillNumber', billNumberSchema);
const Shop2BillNumber = mongoose.model('Shop2BillNumber', billNumberSchema);

// Factory function to return the appropriate model based on shop
const getBillNumberModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1BillNumber;
  } else if (shop === 'shop2') {
    return Shop2BillNumber;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getBillNumberModel };