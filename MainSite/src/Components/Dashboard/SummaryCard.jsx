import React from "react";
import { motion } from "framer-motion";

const SummaryCard = ({ title, value, icon, breakdown = [] }) => {
  return (
    <motion.div
      className="summary-card-dax"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
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
                {typeof item.value === "number" && item.value >= 0
                  ? `${title.includes("Users") ? "" : "₹"}${item.value.toLocaleString()}`
                  : "0"}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SummaryCard;