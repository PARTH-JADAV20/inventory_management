import React from "react";
import { motion } from "framer-motion";

const SaleDetailsModal = ({ sale, onClose }) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>Sale Details</h2>
        <p><strong>Customer:</strong> {sale.profileName || sale.customer}</p>
        <p><strong>Bill No:</strong> {sale.billNo}</p>
        <p><strong>Product:</strong> {sale.items?.[0]?.product || "Unknown"}</p>
        <p><strong>Amount:</strong> ₹{(sale.totalAmount || 0).toLocaleString()}</p>
        {sale.creditAmount > 0 && <p><strong>Credit Amount:</strong> ₹{(sale.creditAmount || 0).toLocaleString()}</p>}
        <p><strong>Payment Method:</strong> {sale.paymentMethod || "Unknown"}</p>
        <p><strong>Date:</strong> {sale.date}</p>
        <p><strong>Status:</strong> {sale.paymentMethod === "Credit" && sale.creditAmount > 0 ? "Credit" : "Cleared"}</p>
        <p><strong>Shop:</strong> {sale.shop}</p>
        <div className="form-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SaleDetailsModal;