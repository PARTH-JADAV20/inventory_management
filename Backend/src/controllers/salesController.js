const asyncHandler = require('express-async-handler');
const { getCustomerModel } = require('../models/Customer');
const { getStockModel } = require('../models/Stock');

// Create a new sale
const createSale = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { billNo, date, phoneNumber, profileName, paymentType, items, totalAmount } = req.body;
  
  const Customer = getCustomerModel(shop);
  const Stock = getStockModel(shop);
  
  // Check if bill number already exists
  const existingBill = await Customer.findOne({ 'profiles.bills.billNo': billNo });
  if (existingBill) {
    res.status(400);
    throw new Error('Bill number already exists');
  }
  
  // Check stock availability
  for (const item of items) {
    // Find all stock entries for this product/unit
    const stockItems = await Stock.find({ 
      name: item.product, 
      unit: item.unit 
    });
    
    // Calculate total available quantity
    const totalAvailable = stockItems.reduce((sum, stock) => sum + stock.quantity, 0);
    
    if (totalAvailable < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.product} (${item.unit}). Available: ${totalAvailable}, Required: ${item.qty}`);
    }
  }
  
  // Find or create customer and profile
  let customer = await Customer.findOne({ phoneNumber });
  let profile = null;
  let profileId = null;
  
  if (customer) {
    profile = customer.profiles.find(p => p.name === profileName && !p.deleteuser.value);
    if (profile) {
      profileId = profile.profileId;
    }
  }
  
  // Initialize variables for advance and credit handling
  let advanceRemaining = null;
  let creditAmount = null;
  
  // Validate advance payment if selected
  if (paymentType === 'Advance') {
    if (!profile || !profile.advance.value) {
      res.status(400);
      throw new Error('Profile does not have advance enabled');
    }
    
    const currentAdvance = profile.advance.currentamount;
    if (currentAdvance < totalAmount) {
      res.status(400);
      throw new Error(`Insufficient advance balance (₹${currentAdvance}). Add ₹${totalAmount - currentAdvance} to credit?`);
    }
    
    advanceRemaining = currentAdvance - totalAmount;
  }
  
  // Handle credit payment
  if (paymentType === 'Credit') {
    creditAmount = totalAmount;
  }
  
  // Create new bill
  const newBill = {
    billNo,
    date,
    items,
    totalAmount,
    advanceRemaining,
    creditAmount,
    paymentMethod: paymentType
  };
  
  // Update stock quantities
  for (const item of items) {
    let remainingQty = item.qty;
    const stockItems = await Stock.find({ 
      name: item.product, 
      unit: item.unit 
    }).sort({ addedDate: 1 }); // FIFO
    
    for (const stockItem of stockItems) {
      if (remainingQty <= 0) break;
      
      const deductQty = Math.min(remainingQty, stockItem.quantity);
      stockItem.quantity -= deductQty;
      remainingQty -= deductQty;
      
      await stockItem.save();
    }
  }
  
  // Create/update customer record
  if (!customer) {
    // Create new customer with profile
    profileId = `profile-${Date.now()}`;
    customer = await Customer.create({
      phoneNumber,
      profiles: [{
        profileId,
        name: profileName,
        advance: { 
          value: paymentType === 'Advance', 
          currentamount: paymentType === 'Advance' ? advanceRemaining : 0,
          showinadvance: true,
          paymentMethod: paymentType
        },
        advanceHistory: [],
        bills: [newBill],
        credit: paymentType === 'Credit' ? totalAmount : 0,
        paymentMethod: paymentType,
        deleteuser: { value: false, date: '' }
      }]
    });
  } else if (!profile) {
    // Add new profile to existing customer
    profileId = `profile-${Date.now()}`;
    customer.profiles.push({
      profileId,
      name: profileName,
      advance: { 
        value: paymentType === 'Advance', 
        currentamount: paymentType === 'Advance' ? advanceRemaining : 0,
        showinadvance: true,
        paymentMethod: paymentType
      },
      advanceHistory: [],
      bills: [newBill],
      credit: paymentType === 'Credit' ? totalAmount : 0,
      paymentMethod: paymentType,
      deleteuser: { value: false, date: '' }
    });
    await customer.save();
  } else {
    // Update existing profile
    profile.bills.push(newBill);
    
    if (paymentType === 'Advance') {
      profile.advance.currentamount = advanceRemaining;
    } else if (paymentType === 'Credit') {
      profile.credit += totalAmount;
    }
    
    await customer.save();
  }
  
  // Return response with the created bill
  res.status(201).json({
    ...newBill,
    phoneNumber,
    profileId,
    profileName
  });
});

// Get all sales
const getSales = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { date, search } = req.query;
  
  const Customer = getCustomerModel(shop);
  
  // Build query based on filters
  let query = {};
  
  // Find all customers
  const customers = await Customer.find(query);
  
  // Extract all bills
  let allSales = [];
  
  customers.forEach(customer => {
    customer.profiles.forEach(profile => {
      profile.bills.forEach(bill => {
        // Apply date filter if specified
        if (date && bill.date !== date) {
          return;
        }
        
        // Apply search filter if specified
        if (search && !profile.name.toLowerCase().includes(search.toLowerCase()) && 
            !customer.phoneNumber.includes(search)) {
          return;
        }
        
        allSales.push({
          billNo: bill.billNo,
          date: bill.date,
          profileName: profile.name,
          phoneNumber: customer.phoneNumber,
          items: bill.items,
          totalAmount: bill.totalAmount,
          paymentType: bill.paymentMethod,
          advanceRemaining: bill.advanceRemaining,
          creditAmount: bill.creditAmount
        });
      });
    });
  });
  
  // Sort by date and bill number
  allSales.sort((a, b) => {
    const dateA = a.date.split('-').reverse().join('-');
    const dateB = b.date.split('-').reverse().join('-');
    
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA); // Newest first
    }
    
    return b.billNo.localeCompare(a.billNo);
  });
  
  res.status(200).json(allSales);
});

// Delete a sale
const deleteSale = asyncHandler(async (req, res) => {
  const { shop, billNo } = req.params;
  
  const Customer = getCustomerModel(shop);
  const Stock = getStockModel(shop);
  
  // Find customer with the bill
  const customer = await Customer.findOne({ 'profiles.bills.billNo': billNo });
  
  if (!customer) {
    res.status(404);
    throw new Error('Sale not found');
  }
  
  // Find profile and bill
  let billFound = false;
  let billToDelete = null;
  let profileToUpdate = null;
  
  for (const profile of customer.profiles) {
    const billIndex = profile.bills.findIndex(b => b.billNo === billNo);
    if (billIndex !== -1) {
      billToDelete = profile.bills[billIndex];
      profileToUpdate = profile;
      profile.bills.splice(billIndex, 1);
      billFound = true;
      break;
    }
  }
  
  if (!billFound) {
    res.status(404);
    throw new Error('Sale not found');
  }
  
  // Restore stock quantities
  for (const item of billToDelete.items) {
    // Add back to stock
    await Stock.create({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: item.product,
      quantity: item.qty,
      unit: item.unit,
      category: '', // We don't have category info in the bill
      price: item.pricePerQty,
      addedDate: new Date()
    });
  }
  
  // Adjust advance or credit if applicable
  if (billToDelete.advanceRemaining !== null) {
    // This was an advance payment
    profileToUpdate.advance.currentamount += billToDelete.totalAmount;
  } else if (billToDelete.creditAmount !== null) {
    // This was a credit payment
    profileToUpdate.credit -= billToDelete.totalAmount;
  }
  
  await customer.save();
  
  res.status(200).json({ message: 'Sale deleted' });
});

module.exports = {
  createSale,
  getSales,
  deleteSale
};