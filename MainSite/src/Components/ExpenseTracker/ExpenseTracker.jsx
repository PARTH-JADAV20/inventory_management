import React, { useState } from "react";
import { parse, format } from "date-fns";
import "./ExpenseTracker.css";

const ExpenseTracker = () => {
  const today = format(new Date(), "dd MMMM yyyy"); // e.g., "19 April 2025"
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    date: today,
    category: "Labor",
    expenseDescription: "",
    amount: "",
    paidTo: "",
    paymentMode: "Cash",
  });
  const [isManualDate, setIsManualDate] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);

  const categories = [
    "Labor",
    "Transport",
    "Site Rent",
    "Fuel",
    "Equipment",
    "Electricity",
    "Government Fees",
    "Consultant Fees",
    "Office Supplies",
    "Safety Equipment",
    "Communication",
    "Miscellaneous",
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "isManualDate") {
      setIsManualDate(checked);
      setFormData({ ...formData, date: today });
    } else if (name === "isManualCategory") {
      setIsManualCategory(checked);
      setFormData({ ...formData, category: checked ? "" : "Labor" });
    }
  };

  // Parse date from "DD MMMM YYYY" to "YYYY-MM-DD" for storage
  const parseDate = (dateStr) => {
    try {
      const parsed = parse(dateStr, "dd MMMM yyyy", new Date());
      if (isNaN(parsed)) throw new Error("Invalid date");
      return format(parsed, "yyyy-MM-dd");
    } catch {
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.category ||
      !formData.expenseDescription ||
      !formData.amount ||
      !formData.paidTo ||
      !formData.paymentMode
    ) {
      alert("Please fill all required fields");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      alert("Amount must be a positive number");
      return;
    }
    const parsedDate = parseDate(formData.date);
    if (!parsedDate) {
      alert("Invalid date format. Use 'DD MMMM YYYY' (e.g., '24 April 2025')");
      return;
    }
    setExpenses([
      ...expenses,
      {
        ...formData,
        date: parsedDate,
        amount: parseFloat(formData.amount),
        id: Date.now(),
      },
    ]);
    setFormData({
      date: today,
      category: isManualCategory ? "" : "Labor",
      expenseDescription: "",
      amount: "",
      paidTo: "",
      paymentMode: "Cash",
    });
    setIsManualDate(false); // Reset checkbox after submission
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Construction Expense Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h2 { color: #ff6b35; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #3a3a5a; padding: 10px; text-align: left; }
            th { background-color: #2b2b40; color: #a1a5b7; }
            td { background-color: #1e1e2d; color: #ffffff; }
          </style>
        </head>
        <body>
          <h2>Construction Expense Report</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Paid To</th>
                <th>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              ${expenses
                .map(
                  (exp) => `
                <tr>
                  <td>${format(new Date(exp.date), "dd MMMM yyyy")}</td>
                  <td>${exp.category}</td>
                  <td>${exp.expenseDescription}</td>
                  <td>₹${exp.amount.toFixed(2)}</td>
                  <td>${exp.paidTo}</td>
                  <td>${exp.paymentMode}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="main-content">
      <div className="form-container">
        <h2>Add Expenses</h2>
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="checkbox-label">
              <div>Date</div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="isManualDate"
                  checked={isManualDate}
                  onChange={handleCheckboxChange}
                />
                Manual Date Input
              </div>
            </label>
            {isManualDate ? (
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="e.g., 24 April 2025"
                required
              />
            ) : (
              <div className="non-editable-date">{formData.date}</div>
            )}
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <div>Category</div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="isManualCategory"
                  checked={isManualCategory}
                  onChange={handleCheckboxChange}
                />
                Manual Category Input
              </div>
            </label>
            {isManualCategory ? (
              <>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter or select category"
                  list="categoryList"
                  required
                />
                <datalist id="categoryList">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Expense Description</label>
            <input
              type="text"
              name="expenseDescription"
              value={formData.expenseDescription}
              onChange={handleInputChange}
              placeholder="Enter expense description"
              required
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
            />
          </div>
          <div className="form-group">
            <label>Paid To</label>
            <input
              type="text"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleInputChange}
              placeholder="Enter recipient"
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Expense Table */}
      <div className="table-container">
        <h2>Expense List</h2>
        <div className="table-actions">
          <button
            className="print-btn"
            onClick={handlePrint}
            disabled={expenses.length === 0}
          >
            Print PDF
          </button>
        </div>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount (₹)</th>
              <th>Paid To</th>
              <th>Payment Mode</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="6">No expenses recorded.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{format(new Date(expense.date), "dd MMMM yyyy")}</td>
                  <td>{expense.category}</td>
                  <td>{expense.expenseDescription}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td>{expense.paidTo}</td>
                  <td>{expense.paymentMode}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTracker;
