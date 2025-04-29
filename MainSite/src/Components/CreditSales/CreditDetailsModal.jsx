import React, { useState } from "react";
import { format } from "date-fns";

const CreditDetailsModal = ({ creditSale, onUpdate, onClose, shop = "shop1" }) => {
  const [payment, setPayment] = useState({ amount: "", mode: "Cash", note: "" });
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000";

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment({ ...payment, [name]: value });
  };

  const addPartialPayment = async () => {
    const amount = parseFloat(payment.amount);
    if (!amount || amount <= 0) {
      setWarning("Please enter a valid payment amount");
      return;
    }
    setLoading(true);
    try {
      const updatedSale = {
        status: creditSale.totalAmount - amount <= 0 ? "Cleared" : "Open",
      };
      const res = await fetch(`${API_URL}/api/${shop}/credits/${creditSale._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSale),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update sale");
      }
      const updatedData = await res.json();
      onUpdate(updatedData);
      setPayment({ amount: "", mode: "Cash", note: "" });
      setWarning("");
    } catch (error) {
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBill = async (manualClose = false) => {
    let finalAmount = creditSale.totalAmount;
    let note = "";
    if (manualClose) {
      const input = prompt("Enter final settlement amount (if any):");
      finalAmount = parseFloat(input) || 0;
      note = prompt("Enter any note (e.g., reason for settlement):") || "";
      if (finalAmount < 0) {
        setWarning("Invalid settlement amount");
        return;
      }
    }
    setLoading(true);
    try {
      const updatedSale = {
        status: "Cleared",
      };
      const res = await fetch(`${API_URL}/api/${shop}/credits/${creditSale._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSale),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to close bill");
      }
      const updatedData = await res.json();
      onUpdate(updatedData);
    } catch (error) {
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Credit Details: {creditSale.customerName}</h2>
        <p>Bill Number: {creditSale.billNumber}</p>
        <p>Phone: {creditSale.phoneNumber}</p>
        <p>Total Credit: ₹{creditSale.totalAmount.toFixed(2)}</p>
        <p>Status: {creditSale.status}</p>
        <h3>Items Taken</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price per Unit (₹)</th>
              <th>Total (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {creditSale.items.map((item, index) => (
              <tr key={index}>
                <td>{item.product}</td>
                <td>{item.qty}</td>
                <td>{item.unit}</td>
                <td>₹{item.pricePerUnit.toFixed(2)}</td>
                <td>₹{(item.amount).toFixed(2)}</td>
                <td>{format(new Date(item.date), "dd MMMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {creditSale.status !== "Cleared" && (
          <div className="form-container">
            <h3>Add Partial Payment</h3>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={payment.amount}
                onChange={handlePaymentChange}
                placeholder="Enter payment amount"
                min="0.01"
                step="0.01"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select name="mode" value={payment.mode} onChange={handlePaymentChange} disabled={loading}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Cheque</option>
              </select>
            </div>
            <div className="form-group">
              <label>Note</label>
              <input
                type="text"
                name="note"
                value={payment.note}
                onChange={handlePaymentChange}
                placeholder="Optional note"
                disabled={loading}
              />
            </div>
            <div className="form-buttons">
              <button className="submit-btn" onClick={addPartialPayment} disabled={loading}>
                {loading ? "Processing..." : "Add Payment"}
              </button>
            </div>
            <h3>Close Bill</h3>
            <div className="form-buttons">
              <button
                className="submit-btn"
                onClick={() => handleCloseBill(false)}
                disabled={loading}
              >
                Close Bill (Full Payment)
              </button>
              <button
                className="submit-btn"
                onClick={() => handleCloseBill(true)}
                disabled={loading}
              >
                Manual Close
              </button>
            </div>
          </div>
        )}
        {warning && <div className="warning">{warning}</div>}
        <div className="form-buttons">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditDetailsModal;