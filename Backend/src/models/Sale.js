const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
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
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  items: [saleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Online', 'Card', 'Cheque', 'Credit', 'Advance'],
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending'],
    default: 'Completed'
  }
}, { timestamps: true });

// Create indexes for common queries
saleSchema.index({ billNumber: 1 });
saleSchema.index({ phoneNumber: 1 });
saleSchema.index({ date: -1 });
saleSchema.index({ createdAt: -1 });

// Create separate models for each shop
const Shop1Sale = mongoose.model('Shop1Sale', saleSchema);
const Shop2Sale = mongoose.model('Shop2Sale', saleSchema);

// Factory function to return the appropriate model based on shop
const getSaleModel = (shop) => {
  if (shop === 'shop1') {
    return Shop1Sale;
  } else if (shop === 'shop2') {
    return Shop2Sale;
  }
  throw new Error('Invalid shop specified');
};

module.exports = { getSaleModel };