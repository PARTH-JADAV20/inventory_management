import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const SaleDetailsModal = ({ sale, onClose }) => {
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
        <p><strong>Customer:</strong> {sale.customer}</p>
        <p><strong>Product:</strong> {sale.product}</p>
        <p><strong>Amount:</strong> ₹{sale.amount.toLocaleString()}</p>
        <p><strong>Date:</strong> {format(new Date(sale.date), "dd MMMM yyyy")}</p>
        <p><strong>Status:</strong> {sale.status}</p>
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