const asyncHandler = require('express-async-handler');
const { getCreditSaleModel } = require('../models/CreditSale');
const { getBillNumberModel } = require('../models/BillNumber');

// Create new credit sale
const createCreditSale = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { customerName, phoneNumber, items, totalAmount } = req.body;
  
  const CreditSale = getCreditSaleModel(shop);
  const BillNumber = getBillNumberModel(shop);
  
  // Generate bill number
  const billNumberDoc = await BillNumber.findOneAndUpdate(
    { shop },
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true }
  );
  
  const billNumber = `${billNumberDoc.prefix}${billNumberDoc.lastNumber}`;
  
  // Create credit sale
  const creditSale = await CreditSale.create({
    billNumber,
    customerName,
    phoneNumber,
    items,
    totalAmount,
    status: 'Open',
    lastTransactionDate: new Date()
  });
  
  res.status(201).json(creditSale);
});

// Get all credit sales
const getCreditSales = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { status } = req.query;
  
  const CreditSale = getCreditSaleModel(shop);
  
  const query = {};
  if (status) {
    query.status = status;
  }
  
  const creditSales = await CreditSale.find(query)
    .sort({ createdAt: -1 });
  
  res.status(200).json(creditSales);
});

// Get credit sale by ID
const getCreditSaleById = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  
  const CreditSale = getCreditSaleModel(shop);
  
  const creditSale = await CreditSale.findById(id);
  
  if (!creditSale) {
    res.status(404);
    throw new Error('Credit sale not found');
  }
  
  res.status(200).json(creditSale);
});

// Update credit sale status
const updateCreditSaleStatus = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  const { status } = req.body;
  
  const CreditSale = getCreditSaleModel(shop);
  
  const creditSale = await CreditSale.findById(id);
  
  if (!creditSale) {
    res.status(404);
    throw new Error('Credit sale not found');
  }
  
  creditSale.status = status;
  creditSale.lastTransactionDate = new Date();
  
  await creditSale.save();
  
  res.status(200).json(creditSale);
});

// Get pending credits
const getPendingCredits = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { overdue } = req.query;
  
  const CreditSale = getCreditSaleModel(shop);
  
  let query = { status: 'Open' };
  
  if (overdue === 'true') {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    query.$or = [
      { createdAt: { $lt: twoMonthsAgo } },
      { totalAmount: { $gt: 10000 } }
    ];
  }
  
  const pendingCredits = await CreditSale.find(query)
    .sort({ createdAt: -1 });
  
  res.status(200).json(pendingCredits);
});

module.exports = {
  createCreditSale,
  getCreditSales,
  getCreditSaleById,
  updateCreditSaleStatus,
  getPendingCredits
};