import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const ProfitByMethodChart = ({ data }) => {
  const chartData = [
    { name: "Cash", value: data.Cash || 0 },
    { name: "Online", value: data.Online || 0 },
    { name: "Cheque", value: data.Cheque || 0 },
    { name: "Credit", value: data.Credit || 0 },
    { name: "Advance", value: data.Advance || 0 },
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
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#2b2b40", border: "1px solid #3a3a5a", color: "#ffffff" }}
            formatter={(value) => `₹${value.toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ProfitByMethodChart;