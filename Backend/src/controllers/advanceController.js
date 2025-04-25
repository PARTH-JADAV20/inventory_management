const asyncHandler = require('express-async-handler');
const { getCustomerModel } = require('../models/Customer');

// Add advance payment
const addAdvancePayment = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  const { date, amount, paymentMethod } = req.body;
  
  const Customer = getCustomerModel(shop);
  
  // Find customer
  const customer = await Customer.findOne({ phoneNumber });
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Find profile
  const profileIndex = customer.profiles.findIndex(p => p.profileId === profileId);
  
  if (profileIndex === -1) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  const profile = customer.profiles[profileIndex];
  
  // Determine transaction type and validate
  const transactionType = amount > 0 ? 'Deposit' : 'Refund';
  const absoluteAmount = Math.abs(amount);
  
  if (transactionType === 'Refund') {
    if (profile.advance.currentamount < absoluteAmount) {
      res.status(400);
      throw new Error('Refund exceeds advance balance');
    }
  }
  
  // Update advance balance
  if (transactionType === 'Deposit') {
    profile.advance.currentamount += absoluteAmount;
  } else {
    profile.advance.currentamount -= absoluteAmount;
  }
  
  // If not already enabled, enable advance
  if (!profile.advance.value) {
    profile.advance.value = true;
  }
  
  // Update payment method if provided
  if (paymentMethod) {
    profile.advance.paymentMethod = paymentMethod;
  }
  
  // Add to advance history
  profile.advanceHistory.push({
    transactionType,
    amount: absoluteAmount,
    date: new Date(date)
  });
  
  await customer.save();
  
  res.status(201).json({
    profileId,
    advance: profile.advance,
    advanceHistory: profile.advanceHistory
  });
});

// Get advance details
const getAdvanceDetails = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  
  const Customer = getCustomerModel(shop);
  
  // Find customer
  const customer = await Customer.findOne({ phoneNumber });
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Find profile
  const profile = customer.profiles.find(p => p.profileId === profileId);
  
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  res.status(200).json({
    advance: profile.advance,
    advanceHistory: profile.advanceHistory
  });
});

module.exports = {
  addAdvancePayment,
  getAdvanceDetails
};