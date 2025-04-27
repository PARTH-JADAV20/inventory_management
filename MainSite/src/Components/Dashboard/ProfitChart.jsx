import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const ProfitChart = ({ data }) => {
  return (
    <motion.div
      className="chart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#a1a5b7" />
          <YAxis stroke="#a1a5b7" />
          <Tooltip
            contentStyle={{ backgroundColor: "#2b2b40", border: "1px solid #3a3a5a", color: "#ffffff" }}
          />
          <Bar dataKey="profit" fill="#ff6b35" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ProfitChart;