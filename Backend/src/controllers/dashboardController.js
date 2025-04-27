const asyncHandler = require('express-async-handler');
const { getCreditSaleModel } = require('../models/CreditSale');
const { getCustomerModel } = require('../models/Customer');
const { getStockModel } = require('../models/Stock');
const { getSaleModel } = require('../models/Sale');

// Helper function to get date range based on time period
const getDateRange = (timePeriod) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (timePeriod) {
    case 'Today':
      return {
        start: startOfDay,
        end: now
      };
    case 'This Week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return {
        start: startOfWeek,
        end: now
      };
    case 'This Month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    default:
      return {
        start: new Date(0),
        end: now
      };
  }
};

// Get dashboard summary
const getDashboardSummary = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { timePeriod } = req.query;
  
  const dateRange = getDateRange(timePeriod);
  
  const CreditSale = getCreditSaleModel(shop);
  const Customer = getCustomerModel(shop);
  const Sale = getSaleModel(shop);
  
  // Get total sales
  const salesQuery = {
    createdAt: { $gte: dateRange.start, $lte: dateRange.end }
  };
  const totalSales = await Sale.aggregate([
    { $match: salesQuery },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Get active customers
  const activeCustomers = await Customer.countDocuments({
    'profiles.deleteuser.value': false
  });
  
  // Get credit sales total
  const creditSalesTotal = await CreditSale.aggregate([
    { $match: { status: 'Open' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Get advance payments total
  const advancePaymentsTotal = await Customer.aggregate([
    { $unwind: '$profiles' },
    { $match: { 'profiles.advance.value': true } },
    { $group: { _id: null, total: { $sum: '$profiles.advance.currentamount' } } }
  ]);
  
  res.status(200).json({
    totalSales: totalSales[0]?.total || 0,
    users: activeCustomers,
    creditSales: creditSalesTotal[0]?.total || 0,
    advancePayments: advancePaymentsTotal[0]?.total || 0
  });
});

// Get recent purchases
const getRecentPurchases = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { timePeriod, limit = 2 } = req.query;
  
  const dateRange = getDateRange(timePeriod);
  const Stock = getStockModel(shop);
  
  const recentPurchases = await Stock.find({
    addedDate: { $gte: dateRange.start, $lte: dateRange.end }
  })
  .sort({ addedDate: -1 })
  .limit(parseInt(limit))
  .select('name quantity unit price addedDate');
  
  res.status(200).json(recentPurchases);
});

// Get recent sales
const getRecentSales = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { timePeriod, limit = 5 } = req.query;
  
  const dateRange = getDateRange(timePeriod);
  const Sale = getSaleModel(shop);
  
  const recentSales = await Sale.find({
    createdAt: { $gte: dateRange.start, $lte: dateRange.end }
  })
  .sort({ createdAt: -1 })
  .limit(parseInt(limit));
  
  res.status(200).json(recentSales);
});

// Get profit data
const getProfitData = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const Sale = getSaleModel(shop);
  
  const profitByMonth = await Sale.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        profit: { $sum: '$totalAmount' }
      }
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        profit: 1
      }
    },
    { $sort: { month: 1 } }
  ]);
  
  res.status(200).json(profitByMonth);
});

// Get low stock alerts
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const Stock = getStockModel(shop);
  
  const lowStockItems = await Stock.aggregate([
    {
      $group: {
        _id: { name: '$name', unit: '$unit' },
        totalStock: { $sum: '$quantity' }
      }
    },
    {
      $match: { totalStock: { $lt: 10 } }
    },
    {
      $project: {
        _id: 0,
        product: '$_id.name',
        stock: '$totalStock',
        unit: '$_id.unit'
      }
    }
  ]);
  
  res.status(200).json(lowStockItems);
});

module.exports = {
  getDashboardSummary,
  getRecentPurchases,
  getRecentSales,
  getProfitData,
  getLowStockAlerts
};