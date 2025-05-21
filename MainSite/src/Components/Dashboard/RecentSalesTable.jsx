import React from "react";
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
            <th>Bill No</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Credit Amount</th>
            <th>Payment Method</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan="6">No recent sales.</td>
            </tr>
          ) : (
            sales.map((sale, index) => (
              <motion.tr
                key={sale.billNo || index}
                whileHover={{ backgroundColor: "#3a3a5a" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onSaleClick(sale)}
                style={{ cursor: "pointer" }}
              >
                <td>{sale.billNo}</td>
                <td>{sale.profileName}</td>
                <td>₹{(sale.totalAmount || 0).toLocaleString()}</td>
                <td>₹{(sale.creditAmount || 0).toLocaleString()}</td>
                <td>{sale.paymentMethod || "Unknown"}</td>
                <td>{sale.date}</td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default RecentSalesTable;