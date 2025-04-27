import React, { useState } from "react";
import { DollarSign, Users, CreditCard, Wallet } from "lucide-react";
import SummaryCard from "../Components/Dashboard/SummaryCard";
import RecentPurchases from "../Components/Dashboard/RecentPurchases";
import RecentSalesTable from "../Components/Dashboard/RecentSalesTable";
import ProfitChart from "../Components/Dashboard/ProfitChart";
import LowStockAlerts from "../Components/Dashboard/LowStockAlerts";
import SaleDetailsModal from "../Components/Dashboard/SaleDetailsModal";
import { motion } from "framer-motion";
import "./Dashboard.css";

const MainDashboard = () => {
  const [selectedShop, setSelectedShop] = useState("All Shops");
  const [selectedTime, setSelectedTime] = useState("This Month");
  const [selectedSale, setSelectedSale] = useState(null);

  const mockData = {
    shops: ["All Shops", "Shop A", "Shop B"],
    sales: [
      {
        id: 1,
        customer: "Amit Sharma",
        product: "Cement (Ambuja)",
        amount: 10000,
        date: "2025-04-25",
        status: "Paid",
        shop: "Shop A",
      },
      {
        id: 2,
        customer: "Rajesh Patel",
        product: "Steel Rod (Tata)",
        amount: 15000,
        date: "2025-04-24",
        status: "Credit",
        shop: "Shop B",
      },
      {
        id: 3,
        customer: "Vikram Singh",
        product: "Sand",
        amount: 5000,
        date: "2025-04-23",
        status: "Paid",
        shop: "Shop A",
      },
      {
        id: 4,
        customer: "Suresh Kumar",
        product: "Bricks",
        amount: 2000,
        date: "2025-04-22",
        status: "Credit",
        shop: "Shop B",
      },
      {
        id: 5,
        customer: "Anil Verma",
        product: "Cement (UltraTech)",
        amount: 12000,
        date: "2025-04-21",
        status: "Paid",
        shop: "Shop A",
      },
    ],
    purchases: [
      {
        id: 1,
        product: "Cement",
        amount: 15000,
        customer: "Rajesh Patel",
        date: "2025-04-24",
      },
      {
        id: 2,
        product: "Steel Rod",
        amount: 20000,
        customer: "Amit Sharma",
        date: "2025-04-23",
      },
    ],
    inventory: [
      { product: "Cement (Ambuja)", stock: 5, unit: "Bag" },
      { product: "Steel Rod (Tata)", stock: 100, unit: "Kg" },
      { product: "Sand", stock: 2, unit: "Truck" },
    ],
    summary: {
      totalSales: 500000,
      users: 25,
      creditSales: 100000,
      advancePayments: 50000,
    },
    profitData: [
      { month: "Jan", profit: 20000 },
      { month: "Feb", profit: 25000 },
      { month: "Mar", profit: 30000 },
      { month: "Apr", profit: 35000 },
    ],
  };

  const filterData = (data, type) => {
    return data.filter((item) => {
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

  const filteredSales = filterData(mockData.sales, "sales");
  const filteredPurchases = filterData(mockData.purchases, "purchases");
  const filteredSummary = {
    totalSales: selectedShop === "All Shops" ? mockData.summary.totalSales : mockData.summary.totalSales / 2,
    users: selectedShop === "All Shops" ? mockData.summary.users : mockData.summary.users / 2,
    creditSales: selectedShop === "All Shops" ? mockData.summary.creditSales : mockData.summary.creditSales / 2,
    advancePayments: selectedShop === "All Shops" ? mockData.summary.advancePayments : mockData.summary.advancePayments / 2,
  };

  return (
    <div className="main-content">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Construction Dashboard</h1>
        <div className="filter-container">
          <div className="filter-group">
            <label>Shop:</label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              {mockData.shops.map((shop) => (
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
          <ProfitChart data={mockData.profitData} />
        </div>
      </motion.div>
      <motion.div
        className="low-stock-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2>Low Stock Alerts</h2>
        <LowStockAlerts inventory={mockData.inventory.filter((item) => item.stock < 10)} />
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