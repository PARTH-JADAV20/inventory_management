// Dashboard.js
import React, { useState, useEffect } from "react";
import { DollarSign, Users, CreditCard, Wallet, BarChart2, ShoppingCart, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import {
  fetchLowStock,
  fetchRecentSales,
  fetchRecentPurchases,
  fetchTotalSales,
  fetchTotalProfit,
  fetchUsers,
  fetchCreditSalesSummary, // Updated import
  fetchAdvancePayments,
} from "../Components/api";
import "./Dashboard.css";

// Utility to format dates
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// SummaryCard Component
const SummaryCard = ({ title, value, icon, breakdown = [] }) => (
  <motion.div
    className="summary-card-dax"
    whileHover={{ scale: 1.05, boxShadow: "var(--shadow-hover)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="summary-icon-dax">{icon}</div>
    <h3>{title}</h3>
    <p>{value}</p>
    {breakdown.length > 0 && (
      <div className="summary-breakdown-dax">
        {breakdown.map((item, index) => (
          <div key={index} className="breakdown-item-dax">
            <span>{item.label}</span>
            <span>
              {item.value != null && !isNaN(item.value) && item.value >= 0
                ? title.includes("Users")
                  ? item.value
                  : `₹${item.value.toLocaleString()}`
                : "N/A"}
            </span>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

// RecentPurchases Component
const RecentPurchases = ({ purchases }) => (
  <div className="purchases-list">
    {purchases.length === 0 ? (
      <p>No recent purchases.</p>
    ) : (
      purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id || `purchase-${index}`}
          className="purchase-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <p>
            <strong>{purchase.product || "Unknown"}</strong> purchased for ₹{(purchase.price || 0).toLocaleString()} by {purchase.supplier || "Unknown"}
          </p>
          <p className="purchase-date">{formatDate(purchase.date)}</p>
        </motion.div>
      ))
    )}
  </div>
);

// RecentSalesTable Component
const RecentSalesTable = ({ sales, onSaleClick }) => (
  <motion.div
    className="table-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <table className="expense-table">
      <thead>
        <tr>
          <th>Bill No</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Payment Method</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {sales.length === 0 ? (
          <tr>
            <td colSpan="5">No recent sales.</td>
          </tr>
        ) : (
          sales.map((sale, index) => (
            <motion.tr
              key={sale.billNo || `sale-${index}`}
              whileHover={{ backgroundColor: "var(--bg-hover)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onSaleClick(sale)}
              style={{ cursor: "pointer" }}
            >
              <td>{sale.billNo || "N/A"}</td>
              <td>{sale.profileName || "Unknown"}</td>
              <td>₹{(sale.amount || 0).toLocaleString()}</td>
              <td>{sale.paymentMethod || "Unknown"}</td>
              <td>{formatDate(sale.date)}</td>
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  </motion.div>
);

// ProfitChart Component
const ProfitChart = ({ data }) => {
  // Generate monthly data for the last 6 months
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      month: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
      profit: data.find(d => d.month === date.toISOString().slice(0, 7))?.profit || 0,
    };
  }).reverse();

  return (
    <motion.div
      className="chart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={months}>
          <XAxis dataKey="month" stroke="var(--text-muted)" />
          <YAxis stroke="var(--text-muted)" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-light)" }}
            formatter={(value) => `₹${(value || 0).toLocaleString()}`}
          />
          <Bar dataKey="profit" fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ProfitByMethodChart Component
const ProfitByMethodChart = ({ data }) => {
  const chartData = [
    { name: "Cash", value: data?.Cash || 0 },
    { name: "Online", value: data?.Online || 0 },
    { name: "Cheque", value: data?.Cheque || 0 },
    { name: "Credit", value: data?.Credit || 0 },
    { name: "Advance", value: data?.Advance || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ["#ff6b35", "#00c4b4", "#8884d8", "#ffca28", "#82ca9d"];

  return (
    <motion.div
      className="chart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, value }) => `${name}: ₹${(value || 0).toLocaleString()}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-dark)", border: "1px solid var(--border)", color: "var(--text-light)" }}
            formatter={(value) => `₹${(value || 0).toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// LowStockAlerts Component
const LowStockAlerts = ({ inventory }) => (
  <motion.div
    className="table-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <table className="expense-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Stock</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {inventory.length === 0 ? (
          <tr>
            <td colSpan="3">No low stock items.</td>
          </tr>
        ) : (
          inventory.map((item, index) => (
            <motion.tr
              key={item._id || index}
              whileHover={{ backgroundColor: "var(--bg-hover)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <td>{item.product || "Unknown"}</td>
              <td className="low-stock">{item.stock || 0}</td>
              <td>{item.unit || "N/A"}</td>
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  </motion.div>
);

// SaleDetailsModal Component
const SaleDetailsModal = ({ sale, onClose }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="modal-content"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Sale Details</h2>
      <p><strong>Customer:</strong> {sale?.profileName || "Unknown"}</p>
      <p><strong>Bill No:</strong> {sale?.billNo || "N/A"}</p>
      <p><strong>Amount:</strong> ₹{(sale?.amount || 0).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> {sale?.paymentMethod || "Unknown"}</p>
      <p><strong>Date:</strong> {formatDate(sale?.date)}</p>
      <p><strong>Shop:</strong> {sale?.shop || "Unknown"}</p>
      <div className="form-buttons">
        <button className="cancel-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// MainDashboard Component
const MainDashboard = () => {
  const [selectedShop, setSelectedShop] = useState("Shop 1");
  const [selectedTime, setSelectedTime] = useState("This Month");
  const [selectedSale, setSelectedSale] = useState(null);
  const [data, setData] = useState({
    shops: ["Shop 1", "Shop 2", "All Shops"],
    sales: [],
    purchases: [],
    inventory: [],
    totalSales: { totalSales: 0, Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 },
    totalProfit: { totalProfit: 0, Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 },
    users: { totalUsers: 0, creditUsers: 0, advanceUsers: 0 },
    creditSales: { totalCreditGiven: 0, totalCreditReceived: 0, Cash: 0, Online: 0, Cheque: 0 },
    advancePayments: { totalAdvance: 0, Cash: 0, Online: 0, Cheque: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPeriodFilter = () => {
    switch (selectedTime) {
      case "Today": return "today";
      case "This Week": return "week";
      case "This Month": return "month";
      default: return "";
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const period = getPeriodFilter();
      if (selectedShop === "All Shops") {
        // For All Shops, fetch only summary data
        const [totalSales, totalProfit, users, creditSales, advancePayments] = await Promise.all([
          fetchTotalSales("Shop 1", period).catch(() => ({})),
          fetchTotalProfit("Shop 1", period).catch(() => ({})),
          fetchUsers("Shop 1").catch(() => ({})),
          fetchCreditSalesSummary("Shop 1", period).catch(() => ({})),
          fetchAdvancePayments("Shop 1", period).catch(() => ({})),
        ]);
        setData(prev => ({
          ...prev,
          totalSales: totalSales || prev.totalSales,
          totalProfit: totalProfit || prev.totalProfit,
          users: users || prev.users,
          creditSales: creditSales || prev.creditSales,
          advancePayments: advancePayments || prev.advancePayments,
          sales: [],
          purchases: [],
          inventory: [],
        }));
      } else {
        const [lowStock, recentSales, recentPurchases, totalSales, totalProfit, users, creditSales, advancePayments] = await Promise.all([
          fetchLowStock(selectedShop, period).catch(() => []),
          fetchRecentSales(selectedShop, period).catch(() => []),
          fetchRecentPurchases(selectedShop, period).catch(() => []),
          fetchTotalSales(selectedShop, period).catch(() => ({})),
          fetchTotalProfit(selectedShop, period).catch(() => ({})),
          fetchUsers(selectedShop).catch(() => ({})),
          fetchCreditSalesSummary(selectedShop, period).catch(() => ({})),
          fetchAdvancePayments(selectedShop, period).catch(() => ({})),
        ]);
        setData({
          shops: ["Shop 1", "Shop 2", "All Shops"],
          sales: recentSales || [],
          purchases: recentPurchases || [],
          inventory: lowStock || [],
          totalSales: totalSales || data.totalSales,
          totalProfit: totalProfit || data.totalProfit,
          users: users || data.users,
          creditSales: creditSales || data.creditSales,
          advancePayments: advancePayments || data.advancePayments,
        });
      }
    } catch (err) {
      setError("Failed to load data. Please check server connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedShop, selectedTime]);

  const filteredSales = (data.sales || []).filter((item) => {
    const matchesShop = selectedShop === "All Shops" || item.shop === selectedShop;
    return matchesShop;
  });

  const filteredPurchases = (data.purchases || []).filter((item) => {
    const matchesShop = selectedShop === "All Shops" || item.shop === selectedShop;
    return matchesShop;
  });

  // Mock profit trend data for chart
  const profitTrend = [
    { month: "2025-01", profit: data.totalProfit.totalProfit * 0.2 },
    { month: "2025-02", profit: data.totalProfit.totalProfit * 0.3 },
    { month: "2025-03", profit: data.totalProfit.totalProfit * 0.4 },
    { month: "2025-04", profit: data.totalProfit.totalProfit * 0.5 },
    { month: "2025-05", profit: data.totalProfit.totalProfit },
  ];

  return (
    <div className="main-content-dax" data-testid="main-dashboard">
      <motion.div
        className="dashboard-header-dax"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard</h1>
        <div className="filter-container-dax">
          <div className="filter-group-dax">
            <label htmlFor="shop-select">Shop</label>
            <select
              id="shop-select"
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
            <label htmlFor="time-select">Period</label>
            <select
              id="time-select"
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
      {error && (
        <motion.div
          className="warning-dax"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
          <button onClick={fetchData}>Retry</button>
        </motion.div>
      )}
      {loading && <div className="loading-dax">Loading...</div>}
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
              value={`₹${(data.totalSales.totalSales || 0).toLocaleString()}`}
              icon={<DollarSign size={24} />}
              breakdown={[
                { label: "Cash", value: data.totalSales.Cash || 0 },
                { label: "Online", value: data.totalSales.Online || 0 },
                { label: "Cheque", value: data.totalSales.Cheque || 0 },
                { label: "Credit", value: data.totalSales.Credit || 0 },
                { label: "Advance", value: data.totalSales.Advance || 0 },
              ]}
            />
            <SummaryCard
              title="Total Profit"
              value={`₹${(data.totalProfit.totalProfit || 0).toLocaleString()}`}
              icon={<BarChart2 size={24} />}
              breakdown={[
                { label: "Cash", value: data.totalProfit.Cash || 0 },
                { label: "Online", value: data.totalProfit.Online || 0 },
                { label: "Cheque", value: data.totalProfit.Cheque || 0 },
                { label: "Credit", value: data.totalProfit.Credit || 0 },
                { label: "Advance", value: data.totalProfit.Advance || 0 },
              ]}
            />
            <SummaryCard
              title="Users"
              value={data.users.totalUsers || 0}
              icon={<Users size={24} />}
              breakdown={[
                { label: "Credit Users", value: data.users.creditUsers || 0 },
                { label: "Advance Users", value: data.users.advanceUsers || 0 },
              ]}
            />
            <SummaryCard
              title="Credit Sales"
              value={`₹${(data.creditSales.totalCreditGiven || 0).toLocaleString()}`}
              icon={<CreditCard size={24} />}
              breakdown={[
                { label: "Cash", value: data.creditSales.Cash || 0 },
                { label: "Online", value: data.creditSales.Online || 0 },
                { label: "Cheque", value: data.creditSales.Cheque || 0 },
              ]}
            />
            <SummaryCard
              title="Advance Payments"
              value={`₹${(data.advancePayments.totalAdvance || 0).toLocaleString()}`}
              icon={<Wallet size={24} />}
              breakdown={[
                { label: "Cash", value: data.advancePayments.Cash || 0 },
                { label: "Online", value: data.advancePayments.Online || 0 },
                { label: "Cheque", value: data.advancePayments.Cheque || 0 },
              ]}
            />
          </motion.div>
          {selectedShop !== "All Shops" && (
            <>
              <motion.div
                className="recent-purchases-container-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2><ShoppingCart size={20} /> Recent Purchases</h2>
                <RecentPurchases purchases={filteredPurchases.slice(0, 3)} />
              </motion.div>
              <motion.div
                className="main-sections-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="section-left-dax">
                  <h2><DollarSign size={20} /> Recent Sales</h2>
                  <RecentSalesTable sales={filteredSales} onSaleClick={setSelectedSale} />
                </div>
                <div className="section-right-dax">
                  <h2><BarChart2 size={20} /> Profit Trend</h2>
                  <ProfitChart data={profitTrend} />
                </div>
              </motion.div>
              <motion.div
                className="low-stock-container-dax"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h2><AlertTriangle size={20} /> Low Stock Alerts</h2>
                <LowStockAlerts inventory={data.inventory} />
              </motion.div>
            </>
          )}
          <motion.div
            className="profit-method-container-dax"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <h2><BarChart2 size={20} /> Profit by Payment Method</h2>
            <ProfitByMethodChart data={data.totalProfit} />
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