import React, { useState, useEffect } from "react";
import { DollarSign, Users, CreditCard, Wallet } from "lucide-react";
import SummaryCard from "../Components/Dashboard/SummaryCard";
import RecentPurchases from "../Components/Dashboard/RecentPurchases";
import RecentSalesTable from "../Components/Dashboard/RecentSalesTable";
import ProfitChart from "../Components/Dashboard/ProfitChart";
import LowStockAlerts from "../Components/Dashboard/LowStockAlerts";
import SaleDetailsModal from "../Components/Dashboard/SaleDetailsModal";
import { motion } from "framer-motion";
import { fetchLowStock, fetchRecentSales, fetchRecentPurchases, fetchProfitTrend, fetchSummary, fetchCombinedSummary } from "../Components/api";
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
    },
    profitData: [],
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
    return date.toISOString().split("T")[0]; // yyyy-MM-dd
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const dateFilter = getDateFilter();
      const [lowStock, recentSales, recentPurchases, profitTrend, summary] = await Promise.all([
        fetchLowStock(selectedShop === "All Shops" ? "Shop 1" : selectedShop).catch(() => []),
        fetchRecentSales(selectedShop === "All Shops" ? "Shop 1" : selectedShop).catch(() => []),
        fetchRecentPurchases(selectedShop === "All Shops" ? "Shop 1" : selectedShop).catch(() => []),
        fetchProfitTrend(selectedShop === "All Shops" ? "Shop 1" : selectedShop).catch(() => []),
        selectedShop === "All Shops"
          ? fetchCombinedSummary(dateFilter)
          : fetchSummary(selectedShop, dateFilter),
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
        },
        profitData: profitTrend || [],
      });
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
  };

  return (
    <div className="main-content-dax">
      <motion.div
        className="dashboard-header-dax"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard Overview</h1>
        <div className="filter-container-dax">
          <div className="filter-group-dax">
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
          <div className="filter-group-dax">
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
      {error && <div className="warning-dax">{error}</div>}
      {loading && <div>Loading...</div>}
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
              value={`₹${(filteredSummary.totalSales ?? 0).toLocaleString()}`}
              icon={<DollarSign size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.cashSales ?? 0 },
                { label: "Credit", value: filteredSummary.creditSales ?? 0 },
                { label: "Advance", value: filteredSummary.advancePayments ?? 0 },
                { label: "Online", value: filteredSummary.onlineSales ?? 0 },
                { label: "Cheque", value: filteredSummary.chequeSales ?? 0 },
              ]}
            />
            <SummaryCard
              title="Users"
              value={filteredSummary.users ?? 0}
              icon={<Users size={24} />}
              breakdown={[
                { label: "Total Users", value: filteredSummary.users ?? 0 },
                { label: "Advance Payment Users", value: filteredSummary.advanceUsers ?? 0 },
                { label: "Credit Sales Users", value: filteredSummary.creditUsers ?? 0 },
              ]}
            />
            <SummaryCard
              title="Credit Sales"
              value={`₹${(filteredSummary.creditSales ?? 0).toLocaleString()}`}
              icon={<CreditCard size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.creditCash ?? 0 },
                { label: "Online", value: filteredSummary.creditOnline ?? 0 },
                { label: "Cheque", value: filteredSummary.creditCheque ?? 0 },
              ]}
            />
            <SummaryCard
              title="Advance Payments"
              value={`₹${(filteredSummary.advancePayments ?? 0).toLocaleString()}`}
              icon={<Wallet size={24} />}
              breakdown={[
                { label: "Cash", value: filteredSummary.advanceCash ?? 0 },
                { label: "Online", value: filteredSummary.advanceOnline ?? 0 },
                { label: "Cheque", value: filteredSummary.advanceCheque ?? 0 },
              ]}
            />
          </motion.div>
          <motion.div
            className="recent-purchases-container-dax"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
            <div className="section-left-dax">
              <h2>Recent Sales</h2>
              <RecentSalesTable sales={filteredSales} onSaleClick={setSelectedSale} />
            </div>
            <div className="section-right-dax">
              <h2>Profit Trend</h2>
              <ProfitChart data={data.profitData} />
            </div>
          </motion.div>
          <motion.div
            className="low-stock-container-dax"
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
        </>
      )}
    </div>
  );
};

export default MainDashboard;