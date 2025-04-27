import React from "react";
import { motion } from "framer-motion";

const SummaryCard = ({ title, value, icon }) => {
  return (
    <motion.div
      className="summary-card"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="summary-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{value}</p>
    </motion.div>
  );
};

export default SummaryCard;