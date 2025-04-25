import React, { useState } from "react";
import { format } from "date-fns";

const CreditDetailsModal = ({ creditSale, onUpdate, onClose }) => {
  const [payment, setPayment] = useState({ amount: "", mode: "Cash", note: "" });
  const [warning, setWarning] = useState("");

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment({ ...payment, [name]: value });
  };

  const addPartialPayment = () => {
    const amount = parseFloat(payment.amount);
    if (!amount || amount <= 0) {
      setWarning("Please enter a valid payment amount");
      return;
    }
    const updatedSale = {
      ...creditSale,
      payments: [
        ...(creditSale.payments || []),
        {
          amount,
          date: new Date().toISOString().split("T")[0],
          mode: payment.mode,
          note: payment.note,
        },
      ],
      totalCredit: creditSale.totalCredit - amount,
      status: creditSale.totalCredit - amount <= 0 ? "Closed" : "Partially Paid",
    };
    onUpdate(updatedSale);
    setPayment({ amount: "", mode: "Cash", note: "" });
    setWarning("");
  };

  const handleCloseBill = (manualClose = false) => {
    let finalAmount = creditSale.totalCredit;
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
    const updatedSale = {
      ...creditSale,
      totalCredit: 0,
      status: manualClose ? "Manually Closed" : "Closed",
      payments: [
        ...(creditSale.payments || []),
        ...(finalAmount > 0
          ? [{
              amount: finalAmount,
              date: new Date().toISOString().split("T")[0],
              mode: payment.mode,
              note: note || "Final settlement",
            }]
          : []),
      ],
    };
    onUpdate(updatedSale);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Credit Details: {creditSale.customerName}</h2>
        <p>Phone: {creditSale.phone}</p>
        <p>Total Credit: ₹{creditSale.totalCredit.toFixed(2)}</p>
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
                <td>₹{(item.qty * item.pricePerUnit).toFixed(2)}</td>
                <td>{format(new Date(item.date), "dd MMMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {creditSale.payments && (
          <>
            <h3>Payments</h3>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {creditSale.payments.map((p, index) => (
                  <tr key={index}>
                    <td>₹{p.amount.toFixed(2)}</td>
                    <td>{format(new Date(p.date), "dd MMMM yyyy")}</td>
                    <td>{p.mode}</td>
                    <td>{p.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {creditSale.status !== "Closed" && creditSale.status !== "Manually Closed" && (
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
              />
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select name="mode" value={payment.mode} onChange={handlePaymentChange}>
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
              />
            </div>
            <div className="form-buttons">
              <button className="submit-btn" onClick={addPartialPayment}>
                Add Payment
              </button>
            </div>
            <h3>Close Bill</h3>
            <div className="form-buttons">
              <button
                className="submit-btn"
                onClick={() => handleCloseBill(false)}
              >
                Close Bill (Full Payment)
              </button>
              <button
                className="submit-btn"
                onClick={() => handleCloseBill(true)}
              >
                Manual Close
              </button>
            </div>
          </div>
        )}
        {warning && <div className="warning">{warning}</div>}
        <div className="form-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditDetailsModal;