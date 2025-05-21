import React from "react";
import { motion } from "framer-motion";

const RecentPurchases = ({ purchases }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown Date";
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="purchases-list">
      {purchases.length === 0 ? (
        <p>No recent purchases.</p>
      ) : (
        purchases.map((purchase, index) => (
          <motion.div
            key={purchase.id}
            className="purchase-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <p>
              <strong>{purchase.product}</strong> purchased for ₹{purchase.amount.toLocaleString()} by {purchase.customer}
            </p>
            <p className="purchase-date">{formatDate(purchase.date)}</p>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default RecentPurchases;