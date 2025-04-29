import React, { useState, useEffect } from "react";
import { DollarSign, Users, CreditCard, Wallet } from "lucide-react";
import SummaryCard from "../Components/Dashboard/SummaryCard";
import RecentPurchases from "../Components/Dashboard/RecentPurchases";
import RecentSalesTable from "../Components/Dashboard/RecentSalesTable";
import ProfitChart from "../Components/Dashboard/ProfitChart";
import LowStockAlerts from "../Components/Dashboard/LowStockAlerts";
import SaleDetailsModal from "../Components/Dashboard/SaleDetailsModal";
import { motion } from "framer-motion";
import { fetchLowStock, fetchRecentSales, fetchRecentPurchases, fetchProfitTrend, fetchSummary } from "../Components/api"; // Adjust path to your api.js
import "./Dashboard.css";

const MainDashboard = () => {
  const [selectedShop, setSelectedShop] = useState("Shop 1");
  const [selectedTime, setSelectedTime] = useState("This Month");
  const [selectedSale, setSelectedSale] = useState(null);
  const [data, setData] = useState({
    shops: ["Shop 1", "Shop 2"],
    sales: [],
    purchases: [],
    inventory: [],
    summary: { totalSales: 0, users: 0, creditSales: 0, advancePayments: 0 },
    profitData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lowStock, recentSales, recentPurchases, profitTrend, summary] = await Promise.all([
        fetchLowStock(selectedShop),
        fetchRecentSales(selectedShop),
        fetchRecentPurchases(selectedShop),
        fetchProfitTrend(selectedShop),
        fetchSummary(selectedShop),
      ]);
      setData({
        shops: ["Shop 1", "Shop 2"],
        sales: recentSales,
        purchases: recentPurchases,
        inventory: lowStock,
        summary,
        profitData: profitTrend,
      });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShop]);

  const filterData = (items, type) => {
    return items.filter((item) => {
      const matchesShop = selectedShop === "All Shops" || item.shop === selectedShop;
      const itemDate = new Date(item.date);
      const today = new Date();
      let matchesTime = true;
      if (selectedTime === "Today") {
        matchesTime = itemDate.toDateString() === today.toDateString();
      } else if (selectedTime === "This Week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesTime = itemDate >= weekAgo;
      } else if (selectedTime === "This Month") {
        matchesTime = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      }
      return matchesShop && matchesTime;
    });
  };

  const filteredSales = filterData(data.sales, "sales");
  const filteredPurchases = filterData(data.purchases, "purchases");
  const filteredSummary = {
    totalSales: selectedShop === "All Shops" ? data.summary.totalSales : data.summary.totalSales,
    users: selectedShop === "All Shops" ? data.summary.users : data.summary.users,
    creditSales: selectedShop === "All Shops" ? data.summary.creditSales : data.summary.creditSales,
    advancePayments: selectedShop === "All Shops" ? data.summary.advancePayments : data.summary.advancePayments,
  };

  return (
    <div className="main-content">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard Overview</h1>
        <div className="filter-container">
          <div className="filter-group">
            <label>Shop:</label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              {data.shops.map((shop) => (
                <option key={shop} value={shop}>
                  {shop}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Time Period:</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
      </motion.div>
      {error && <div className="warning">{error}</div>}
      {loading && <div>Loading...</div>}
      <motion.div
        className="summary-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SummaryCard
          title="Total Sales"
          value={`₹${filteredSummary.totalSales.toLocaleString()}`}
          icon={<DollarSign size={24} />}
        />
        <SummaryCard
          title="Users"
          value={filteredSummary.users}
          icon={<Users size={24} />}
        />
        <SummaryCard
          title="Credit Sales"
          value={`₹${filteredSummary.creditSales.toLocaleString()}`}
          icon={<CreditCard size={24} />}
        />
        <SummaryCard
          title="Advance Payments"
          value={`₹${filteredSummary.advancePayments.toLocaleString()}`}
          icon={<Wallet size={24} />}
        />
      </motion.div>
      <motion.div
        className="recent-purchases-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2>Recent Purchases</h2>
        <RecentPurchases purchases={filteredPurchases.slice(0, 2)} />
      </motion.div>
      <motion.div
        className="main-sections"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="section-left">
          <h2>Recent Sales</h2>
          <RecentSalesTable sales={filteredSales} onSaleClick={setSelectedSale} />
        </div>
        <div className="section-right">
          <h2>Profit Trend</h2>
          <ProfitChart data={data.profitData} />
        </div>
      </motion.div>
      <motion.div
        className="low-stock-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2>Low Stock Alerts</h2>
        <LowStockAlerts inventory={data.inventory} />
      </motion.div>
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};

export default MainDashboard;