import React from "react";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";

const SalesStatsCard = ({ stats }) => {
  return (
    <motion.div
      className="summary-card-dax"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="summary-icon-dax">
        <BarChart2 size={24} />
      </div>
      <h3>Sales Stats</h3>
      <div className="summary-breakdown-dax">
        <div className="breakdown-item-dax">
          <span>Daily Sales</span>
          <span>₹{(stats.dailySales || 0).toLocaleString()}</span>
        </div>
        <div className="breakdown-item-dax">
          <span>Monthly Sales</span>
          <span>₹{(stats.monthlySales || 0).toLocaleString()}</span>
        </div>
        <div className="breakdown-item-dax">
          <span>Total Sales</span>
          <span>₹{(stats.totalSales || 0).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesStatsCard;