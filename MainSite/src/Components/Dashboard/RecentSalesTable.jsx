import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const RecentSalesTable = ({ sales, onSaleClick }) => {
  return (
    <motion.div
      className="table-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <table className="expense-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount (₹)</th>
            <th>Date</th>
            <th>Status</th>
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
                key={sale.id}
                onClick={() => onSaleClick(sale)}
                whileHover={{ backgroundColor: "#3a3a5a" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td>{sale.customer}</td>
                <td>{sale.product}</td>
                <td>₹{sale.amount.toLocaleString()}</td>
                <td>{format(new Date(sale.date), "dd MMMM yyyy")}</td>
                <td>{sale.status}</td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default RecentSalesTable;