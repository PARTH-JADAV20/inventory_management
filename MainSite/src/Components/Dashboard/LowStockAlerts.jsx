import React from "react";
import { motion } from "framer-motion";

const LowStockAlerts = ({ inventory }) => {
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
            <th>Product</th>
            <th>Stock</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td colSpan="3">No low stock items.</td>
            </tr>
          ) : (
            inventory.map((item, index) => (
              <motion.tr
                key={index}
                whileHover={{ backgroundColor: "#3a3a5a" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td>{item.product}</td>
                <td className="low-stock">{item.stock}</td>
                <td>{item.unit}</td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default LowStockAlerts;