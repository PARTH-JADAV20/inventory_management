const mongoose = require('mongoose');

const creditSaleItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0.01
  },
  unit: {
    type: String,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0.01
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  date: {
    type: Date,
    required: true
  }
}, { _id: false });

const creditSaleSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  items: [creditSaleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  status: {
    type: String,
    enum: ['Open', 'Cleared'],
    default: 'Open'
  },
  lastTransactionDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for common queries
creditSaleSchema.index({ billNumber: 1 });
creditSaleSchema.index({ phoneNumber: 1 });
creditSaleSchema.index({ status: 1 });
creditSaleSchema.index({ createdAt: -1 });

// Create separate models for each shop
const Shop1CreditSale = mongoose.model('Shop1CreditSale', creditSaleSchema);
const Shop2CreditSale = mongoose.model('Shop2CreditSale', creditSaleSchema);

// Factory function to return the appropriate model based on shop
const getCreditSaleModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1CreditSale;
  } else if (shop === 'shop2') {
    return Shop2CreditSale;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getCreditSaleModel };