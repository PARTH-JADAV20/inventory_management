const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const {
  getDashboardSummary,
  getRecentPurchases,
  getRecentSales,
  getProfitData,
  getLowStockAlerts
} = require('../controllers/dashboardController');

// Apply shop validation middleware
router.use(validateShop);

router.get('/summary', getDashboardSummary);
router.get('/recent-purchases', getRecentPurchases);
router.get('/recent-sales', getRecentSales);
router.get('/profit', getProfitData);
router.get('/low-stock', getLowStockAlerts);

module.exports = router;