import React, { useState, useEffect } from "react";
import { parse, format } from "date-fns";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import {
  fetchOutgoingPayments,
  addOutgoingPayment,
  updateOutgoingPayment,
  clearPaymentAmount,
  deleteOutgoingPayment,
} from "../../Components/api"; // Import API functions
import "./OutgoingPayments.css";

const OutgoingPayments = () => {
  const today = format(new Date(), "dd-MM-yyyy");
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    date: today,
    paidTo: "", // Changed to match schema naming
    amount: "",
    description: "",
  });
  const [isManualDate, setIsManualDate] = useState(false); // Renamed for clarity
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchPaidTo, setSearchPaidTo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearAmount, setClearAmount] = useState({});
  const [showClearModal, setShowClearModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(null);
        const data = await fetchOutgoingPayments(searchPaidTo);
        setPayments(data || []);
      } catch (err) {
        setError(`Error fetching payments: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchPaidTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "date" && value) {
      // Convert date from yyyy-MM-dd (input) to dd-MM-yyyy
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      if (!isNaN(parsed)) {
        setFormData({ ...formData, date: format(parsed, "dd-MM-yyyy") });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    setIsManualDate(e.target.checked);
    setFormData({ ...formData, date: today });
  };

  const validateDate = (dateStr) => {
    try {
      const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
      return !isNaN(parsed);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.paidTo || !formData.amount) {
      alert("Please fill all required fields");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be a positive number");
      return;
    }
    if (!validateDate(formData.date)) {
      alert("Invalid date format. Use 'dd-mm-yyyy' (e.g., '24-04-2025')");
      return;
    }

    const paymentData = {
      date: formData.date, // Already in dd-MM-yyyy
      paidTo: formData.paidTo,
      amount: parseFloat(formData.amount),
      description: formData.description || "",
      amountPaid: editingPayment ? editingPayment.amountPaid : 0,
    };

    try {
      setError(null);
      setLoading(true);
      if (editingPayment) {
        const updatedPayment = await updateOutgoingPayment(editingPayment.id, paymentData);
        setPayments((prev) =>
          prev.map((pay) => (pay.id === updatedPayment.id ? updatedPayment : pay))
        );
        setEditingPayment(null);
      } else {
        const newPayment = await addOutgoingPayment(paymentData);
        setPayments((prev) => [...prev, newPayment]);
      }
      setFormData({
        date: today,
        paidTo: "",
        amount: "",
        description: "",
      });
      setIsManualDate(false);
    } catch (err) {
      setError(`Error saving payment: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      date: payment.date, // Already in dd-MM-yyyy
      paidTo: payment.paidTo,
      amount: payment.amount,
      description: payment.description,
    });
    setIsManualDate(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      setError(null);
      setLoading(true);
      await deleteOutgoingPayment(id);
      setPayments((prev) => prev.filter((pay) => pay.id !== id));
    } catch (err) {
      setError(`Error deleting payment: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAmount = async (payment) => {
    const amountToClear = parseFloat(clearAmount[payment.id] || 0);
    if (isNaN(amountToClear) || amountToClear <= 0) {
      alert("Please enter a valid amount to clear");
      return;
    }
    if (amountToClear > payment.amount - (payment.amountPaid || 0)) {
      alert("Clear amount cannot exceed remaining amount");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const updatedPayment = await clearPaymentAmount(payment.id, amountToClear);
      setPayments((prev) =>
        prev.map((pay) =>
          pay.id === payment.id
            ? { ...pay, amountPaid: (pay.amountPaid || 0) + updatedPayment.clearAmount }
            : pay
        )
      );
      setClearAmount((prev) => ({ ...prev, [payment.id]: "" }));
      setShowClearModal(null);
    } catch (err) {
      setError(`Error clearing payment: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalOutstanding = () => {
    return payments.reduce((total, pay) => total + (pay.amount - (pay.amountPaid || 0)), 0);
  };

  const filteredPayments = payments.filter((pay) =>
    searchPaidTo ? pay.paidTo.toLowerCase().includes(searchPaidTo.toLowerCase()) : true
  );

  const formatDateForPicker = (dateStr) => {
    if (!dateStr) return "";
    const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
    return isNaN(parsed) ? "" : format(parsed, "yyyy-MM-dd");
  };

  return (
    <div className="main-content">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      <div className="form-container">
        <h2>{editingPayment ? "Edit Outgoing Payment" : "Add Outgoing Payment"}</h2>
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="checkbox-label">
              <div>Date</div>
              <div className="checkbox-container-p">
                <input
                  type="checkbox"
                  name="isManualDate"
                  checked={isManualDate}
                  onChange={handleCheckboxChange}
                  disabled={loading}
                />
                Manual Date
              </div>
            </label>
            {isManualDate ? (
              <input
                type="date"
                name="date"
                value={formatDateForPicker(formData.date)}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            ) : (
              <div className="non-editable-date">{formData.date}</div>
            )}
          </div>
          <div className="form-group">
            <label>Paid To</label>
            <input
              type="text"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleInputChange}
              placeholder="Enter receiver"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description (optional)"
              disabled={loading}
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn" disabled={loading}>
              {editingPayment ? "Update Payment" : "Add Payment"}
            </button>
            {editingPayment && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingPayment(null);
                  setFormData({
                    date: today,
                    paidTo: "",
                    amount: "",
                    description: "",
                  });
                  setIsManualDate(false);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="total-outstanding-container">
        <div className="total-outstanding">
          Total Outstanding: ₹{calculateTotalOutstanding().toFixed(2)}
        </div>
      </div>

      <div className="table-container">
        <h2>Outgoing Payments List</h2>
        <div className="table-actions">
          <div className="search-container">
            <div className="search-group-p">
              <label>Paid To:</label>
              <input
                type="text"
                value={searchPaidTo}
                onChange={(e) => setSearchPaidTo(e.target.value)}
                placeholder="Search by receiver"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <table className="payment-table">
          <thead>
            <tr>
              <th>Sr.NO</th>
              <th>Date</th>
              <th>Paid To</th>
              <th>Amount (₹)</th>
              <th>Amount Paid (₹)</th>
              <th>Amount Left (₹)</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="8">{loading ? "Loading..." : error ? error : "No payments found."}</td>
              </tr>
            ) : (
              filteredPayments.map((payment, index) => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: "bolder", color: "#ff6b2c" }}>{index + 1}</td>
                  <td>{payment.date}</td> {/* Already in dd-MM-yyyy */}
                  <td>{payment.paidTo}</td>
                  <td>₹{payment.amount.toFixed(2)}</td>
                  <td>₹{(payment.amountPaid || 0).toFixed(2)}</td>
                  <td>₹{(payment.amount - (payment.amountPaid || 0)).toFixed(2)}</td>
                  <td>{payment.description || '-'}</td>
                  <td style={{ display: "flex", gap: "5px" }}>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(payment)}
                      title="Edit"
                      disabled={loading}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="clear-btn"
                      onClick={() => setShowClearModal(payment.id)}
                      title="Clear Amount"
                      disabled={loading || payment.amount === (payment.amountPaid || 0)}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(payment.id)}
                      title="Delete"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showClearModal && (
          <div className="clear-modal">
            <div className="clear-modal-content">
              <h3>Clear Payment Amount</h3>
              <p>Enter amount to clear for {payments.find((p) => p.id === showClearModal)?.paidTo}</p>
              <input
                type="number"
                value={clearAmount[showClearModal] || ""}
                onChange={(e) =>
                  setClearAmount({ ...clearAmount, [showClearModal]: e.target.value })
                }
                placeholder="Enter amount to clear"
                min="0"
                step="0.01"
                disabled={loading}
              />
              <div className="clear-modal-buttons">
                <button
                  className="submit-btn"
                  onClick={() => handleClearAmount(payments.find((p) => p.id === showClearModal))}
                  disabled={loading}
                >
                  Clear
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowClearModal(null);
                    setClearAmount({ ...clearAmount, [showClearModal]: "" });
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutgoingPayments;