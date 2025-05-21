import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const SalesTrendCard = ({ stats }) => {
  const data = [
    { name: "Daily", sales: stats.dailySales || 0 },
    { name: "Monthly", sales: stats.monthlySales || 0 },
    { name: "Total", sales: stats.totalSales || 0 },
  ];

  return (
    <motion.div
      className="sales-trend-card-dax"
      whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.2 }}
    >
      <h3>Sales Trend</h3>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#a1a5b7" />
          <YAxis stroke="#a1a5b7" />
          <Tooltip
            contentStyle={{ backgroundColor: "#2b2b40", border: "1px solid #3a3a5a", color: "#ffffff" }}
            formatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Bar dataKey="sales" fill="#00c4b4" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SalesTrendCard;