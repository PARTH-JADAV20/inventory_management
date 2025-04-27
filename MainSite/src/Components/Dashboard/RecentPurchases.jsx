import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const RecentPurchases = ({ purchases }) => {
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
            <p className="purchase-date">{format(new Date(purchase.date), "dd MMMM yyyy")}</p>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default RecentPurchases;