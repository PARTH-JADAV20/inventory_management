import React, { useState, useEffect } from "react";
import { DollarSign, Users, CreditCard, Wallet } from "lucide-react";
import SummaryCard from "../Components/Dashboard/SummaryCard";
import RecentPurchases from "../Components/Dashboard/RecentPurchases";
import RecentSalesTable from "../Components/Dashboard/RecentSalesTable";
import ProfitChart from "../Components/Dashboard/ProfitChart";
import ProfitByMethodChart from "../Components/Dashboard/ProfitByMethodChart";
import LowStockAlerts from "../Components/Dashboard/LowStockAlerts";
import SalesStatsCard from "../Components/Dashboard/SalesStatsCard";
import SalesTrendCard from "../Components/Dashboard/SalesTrendCard";
import SaleDetailsModal from "../Components/Dashboard/SaleDetailsModal";
import { motion } from "framer-motion";
import {
  fetchLowStock,
  fetchRecentSales,
  fetchRecentPurchases,
  fetchProfitTrend,
  fetchSalesStats,
  fetchSummary,
  fetchCombinedSummary,
  fetchProfitByMethod,
} from "../Components/api";
import "./Dashboard.css";

const MainDashboard = () => {
  const [selectedShop, setSelectedShop] = useState("Shop 1");
  const [selectedTime, setSelectedTime] = useState("This Month");
  const [selectedSale, setSelectedSale] = useState(null);
  const [data, setData] = useState({
    shops: ["Shop 1", "Shop 2", "All Shops"],
    sales: [],
    purchases: [],
    inventory: [],
    summary: {
      totalSales: 0,
      users: 0,
      creditSales: 0,
      advancePayments: 0,
      cashSales: 0,
      onlineSales: 0,
      chequeSales: 0,
      advanceUsers: 0,
      creditUsers: 0,
      creditCash: 0,
      creditOnline: 0,
      creditCheque: 0,
      advanceCash: 0,
      advanceOnline: 0,
      advanceCheque: 0,
      profit: 0,
    },
    profitData: [],
    salesStats: { dailySales: 0, monthlySales: 0, totalSales: 0 },
    profitByMethod: { Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getDateFilter = () => {
    const today = new Date();
    if (selectedTime === "Today") {
      return formatDate(today);
    } else if (selectedTime === "This Week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return formatDate(weekAgo);
    } else if (selectedTime === "This Month") {
      return formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    return "";
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // DD-MM-YYYY
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const dateFilter = getDateFilter();
      if (selectedShop === "All Shops") {
        const [summary, profitByMethod] = await Promise.all([
          fetchCombinedSummary(dateFilter).catch(() => ({})),
          fetchProfitByMethod("Shop 1", dateFilter).catch(() => ({})),
        ]);
        setData({
          shops: ["Shop 1", "Shop 2", "All Shops"],
          sales: [],
          purchases: [],
          inventory: [],
          summary: summary || {
            totalSales: 0,
            users: 0,
            creditSales: 0,
            advancePayments: 0,
            cashSales: 0,
            onlineSales: 0,
            chequeSales: 0,
            advanceUsers: 0,
            creditUsers: 0,
            creditCash: 0,
            creditOnline: 0,
            creditCheque: 0,
            advanceCash: 0,
            advanceOnline: 0,
            advanceCheque: 0,
            profit: 0,
          },
          profitData: [],
          salesStats: { dailySales: 0, monthlySales: 0, totalSales: 0 },
          profitByMethod: profitByMethod || { Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 },
        });
      } else {
        const [lowStock, recentSales, recentPurchases, profitTrend, summary, salesStats, profitByMethod] = await Promise.all([
          fetchLowStock(selectedShop).catch(() => []),
          fetchRecentSales(selectedShop).catch(() => []),
          fetchRecentPurchases(selectedShop).catch(() => []),
          fetchProfitTrend(selectedShop).catch(() => []),
          fetchSummary(selectedShop, dateFilter).catch(() => ({})),
          fetchSalesStats(selectedShop).catch(() => ({})),
          fetchProfitByMethod(selectedShop, dateFilter).catch(() => ({})),
        ]);
        setData({
          shops: ["Shop 1", "Shop 2", "All Shops"],
          sales: recentSales || [],
          purchases: recentPurchases || [],
          inventory: lowStock || [],
          summary: summary || {
            totalSales: 0,
            users: 0,
            creditSales: 0,
            advancePayments: 0,
            cashSales: 0,
            onlineSales: 0,
            chequeSales: 0,
            advanceUsers: 0,
            creditUsers: 0,
            creditCash: 0,
            creditOnline: 0,
            creditCheque: 0,
            advanceCash: 0,
            advanceOnline: 0,
            advanceCheque: 0,
            profit: 0,
          },
          profitData: profitTrend || [],
          salesStats: salesStats || { dailySales: 0, monthlySales: 0, totalSales: 0 },
          profitByMethod: profitByMethod || { Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 },
        });
      }
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShop, selectedTime]);

  const filterData = (items, type) => {
    return items.filter((item) => {
      const matchesShop = selectedShop === "All Shops" || item.shop === selectedShop;
      const itemDate = parseDate(item.date);
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

  const filteredSales = filterData(data.sales || [], "sales");
  const filteredPurchases = filterData(data.purchases || [], "purchases");
  const filteredSummary = {
    totalSales: data.summary?.totalSales ?? 0,
    users: data.summary?.users ?? 0,
    creditSales: data.summary?.creditSales ?? 0,
    advancePayments: data.summary?.advancePayments ?? 0,
    cashSales: data.summary?.cashSales ?? 0,
    onlineSales: data.summary?.onlineSales ?? 0,
    chequeSales: data.summary?.chequeSales ?? 0,
    advanceUsers: data.summary?.advanceUsers ?? 0,
    creditUsers: data.summary?.creditUsers ?? 0,
    creditCash: data.summary?.creditCash ?? 0,
    creditOnline: data.summary?.creditOnline ?? 0,
    creditCheque: data.summary?.creditCheque ?? 0,
    advanceCash: data.summary?.advanceCash ?? 0,
    advanceOnline: data.summary?.advanceOnline ?? 0,
    advanceCheque: data.summary?.advanceCheque ?? 0,
    profit: data.summary?.profit ?? 0,
  };

  return (
    <div className="main-content-dax" data-testid="main-dashboard">
      <motion.div
        className="dashboard-header-dax"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard Overview</h1>
        <div className="filter-container-dax">
          <div className="filter-group-dax">
            <label htmlFor="shop-select">Shop:</label>
            <select
              id="shop-select"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              data-testid="shop-select"
            >
              {data.shops.map((shop) => (
                <option key={shop} value={shop}>
                  {shop}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group-dax">
            <label htmlFor="time-select">Time Period:</label>
            <select
              id="time-select"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              data-testid="time-select"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
      </motion.div>
      {error && (
        <motion.div
          className="warning-dax"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          data-testid="error-message"
        >
          {error}
          <button onClick={fetchData} data-testid="retry-button">
            Retry
          </button>
        </motion.div>
      )}
      {loading && <div className="loading-dax" data-testid="loading">Loading...</div>}
      {!loading && (
        <>
          <motion.div
            className="summary-container-dax"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SummaryCard
              title="Total Sales"
              value={`₹${filteredSummary.totalSales.toLocaleString()}`}
              icon={<DollarSign size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.cashSales },
                { label: "Credit", value: filteredSummary.creditSales },
                { label: "Advance", value: filteredSummary.advancePayments },
                { label: "Online", value: filteredSummary.onlineSales },
                { label: "Cheque", value: filteredSummary.chequeSales },
              ]}
              data-testid="total-sales-card"
            />
            <SummaryCard
              title="Users"
              value={filteredSummary.users}
              icon={<Users size={24} />}
              breakdown={[
                { label: "Total Users", value: filteredSummary.users },
                { label: "Advance Payment Users", value: filteredSummary.advanceUsers },
                { label: "Credit Sales Users", value: filteredSummary.creditUsers },
              ]}
              data-testid="users-card"
            />
            <SummaryCard
              title="Credit Sales"
              value={`₹${filteredSummary.creditSales.toLocaleString()}`}
              icon={<CreditCard size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.creditCash },
                { label: "Online", value: filteredSummary.creditOnline },
                { label: "Cheque", value: filteredSummary.creditCheque },
              ]}
              data-testid="credit-sales-card"
            />
            <SummaryCard
              title="Advance Payments"
              value={`₹${filteredSummary.advancePayments.toLocaleString()}`}
              icon={<Wallet size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.advanceCash },
                { label: "Online", value: filteredSummary.advanceOnline },
                { label: "Cheque", value: filteredSummary.advanceCheque },
              ]}
              data-testid="advance-payments-card"
            />
            <SalesTrendCard stats={data.salesStats} data-testid="sales-trend-card" />
            <SalesStatsCard stats={data.salesStats} data-testid="sales-stats-card" />
          </motion.div>
          {selectedShop !== "All Shops" && (
            <>
              <motion.div
                className="recent-purchases-container-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                data-testid="recent-purchases"
              >
                <h2>Recent Purchases</h2>
                <RecentPurchases purchases={filteredPurchases.slice(0, 2)} />
              </motion.div>
              <motion.div
                className="main-sections-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="section-left-dax" data-testid="recent-sales">
                  <h2>Recent Sales</h2>
                  <RecentSalesTable sales={filteredSales} onSaleClick={setSelectedSale} />
                </div>
                <div className="section-right-dax" data-testid="profit-trend">
                  <h2>Profit Trend</h2>
                  <ProfitChart data={data.profitData} />
                </div>
              </motion.div>
              <motion.div
                className="low-stock-container-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                data-testid="low-stock"
              >
                <h2>Low Stock Alerts</h2>
                <LowStockAlerts inventory={data.inventory} />
              </motion.div>
            </>
          )}
          <motion.div
            className="profit-method-container-dax"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            data-testid="profit-by-method"
          >
            <h2>Profit by Payment Method</h2>
            <ProfitByMethodChart data={data.profitByMethod} />
          </motion.div>
          {selectedSale && (
            <SaleDetailsModal
              sale={selectedSale}
              onClose={() => setSelectedSale(null)}
              data-testid="sale-details-modal"
            />
          )}
        </>
      )}
    </div>
  );
};

export default MainDashboard;