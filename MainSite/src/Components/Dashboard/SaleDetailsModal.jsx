import React from "react";
import { motion } from "framer-motion";

const SaleDetailsModal = ({ sale, onClose }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown Date";
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
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
        <p><strong>Customer:</strong> {sale.profileName || sale.customer || "Unknown"}</p>
        <p><strong>Bill No:</strong> {sale.billNo || "N/A"}</p>
        <p><strong>Product:</strong> {sale.items?.[0]?.product || "Unknown"}</p>
        <p><strong>Amount:</strong> ₹{(sale.totalAmount || 0).toLocaleString()}</p>
        {sale.creditAmount > 0 && <p><strong>Credit Amount:</strong> ₹{(sale.creditAmount || 0).toLocaleString()}</p>}
        <p><strong>Payment Method:</strong> {sale.paymentMethod || "Unknown"}</p>
        <p><strong>Date:</strong> {formatDate(sale.date)}</p>
        <p><strong>Status:</strong> {sale.paymentMethod === "Credit" && sale.creditAmount > 0 ? "Credit" : "Cleared"}</p>
        <p><strong>Shop:</strong> {sale.shop || "Unknown"}</p>
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