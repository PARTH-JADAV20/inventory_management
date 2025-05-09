// backend/controllers/stockController.js
const asyncHandler = require('express-async-handler');
const { getStockModel } = require('../models/Stock');

// Get all stock items
const getStock = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { category, search, view } = req.query;
  
  const Stock = getStockModel(shop);
  
  // Build query based on filters
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  // Fetch stock items
  let stockItems = await Stock.find(query).sort({ addedDate: -1 });
  
  // For 'current' view, return ungrouped items
  if (view === 'current') {
    return res.status(200).json(stockItems);
  }
  
  // For 'grouped' view, group items (optional, if needed elsewhere)
  if (view === 'grouped') {
    const groupedItems = {};
    
    stockItems.forEach(item => {
      const key = `${item.name}-${item.category}-${item.unit}`;
      
      if (!groupedItems[key]) {
        groupedItems[key] = {
          id: item.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: 0,
          totalValue: 0,
        };
      }
      
      groupedItems[key].quantity += item.quantity;
      groupedItems[key].totalValue += item.quantity * item.price;
    });
    
    const result = Object.values(groupedItems).map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      price: item.quantity > 0 ? item.totalValue / item.quantity : 0,
      addedDate: new Date(), // Consider preserving the latest addedDate
    }));
    
    return res.status(200).json(result);
  }
  
  // Default: return ungrouped items (same as 'current')
  res.status(200).json(stockItems);
});

// Add new stock item
const addStock = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { name, quantity, unit, category, price, addedDate } = req.body;
  
  const Stock = getStockModel(shop);
  
  // Generate unique ID
  const maxIdItem = await Stock.findOne().sort({ id: -1 });
  const newId = maxIdItem ? maxIdItem.id + 1 : 1;
  
  // Create stock item
  const stockItem = await Stock.create({
    id: newId,
    name,
    quantity,
    unit,
    category,
    price,
    addedDate: addedDate || new Date(),
  });
  
  res.status(201).json(stockItem);
});

// Update stock item
const updateStock = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  const updateData = req.body;
  
  const Stock = getStockModel(shop);
  
  // Find and update stock item
  const stockItem = await Stock.findOneAndUpdate(
    { id: Number(id) },
    updateData,
    { new: true }
  );
  
  if (!stockItem) {
    res.status(404);
    throw new Error('Stock item not found');
  }
  
  res.status(200).json(stockItem);
});

// Delete stock item by ID
const deleteStock = asyncHandler(async (req, res) => {
  const { shop, id } = req.params;
  
  const Stock = getStockModel(shop);
  
  // Delete stock item by ID
  const result = await Stock.deleteOne({ id: Number(id) });
  
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error('Stock item not found');
  }
  
  res.status(200).json({ message: 'Stock item deleted' });
});

module.exports = {
  getStock,
  addStock,
  updateStock,
  deleteStock,
};