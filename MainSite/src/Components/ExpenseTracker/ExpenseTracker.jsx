import React, { useState } from "react";
import { parse, format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import "./ExpenseTracker.css";

const ExpenseTracker = () => {
  const today = format(new Date(), "dd MMMM yyyy"); // e.g., "19 April 2025"
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: "2025-04-20",
      category: "Labor",
      expenseDescription: "Mason payment",
      amount: 5000,
      paidTo: "Rajesh",
      paymentMode: "Cash",
    },
    {
      id: 2,
      date: "2025-04-21",
      category: "Transport",
      expenseDescription: "Truck for sand delivery",
      amount: 3000,
      paidTo: "Mohan Logistics",
      paymentMode: "UPI",
    },
    {
      id: 3,
      date: "2025-04-22",
      category: "Site Rent",
      expenseDescription: "Monthly rent for site",
      amount: 15000,
      paidTo: "Landowner",
      paymentMode: "Cheque",
    },
    {
      id: 4,
      date: "2025-04-23",
      category: "Fuel",
      expenseDescription: "Diesel for mixer machine",
      amount: 1200,
      paidTo: "Petrol Bunk",
      paymentMode: "Card",
    },
  ]);

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
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [searchDate, setSearchDate] = useState(""); // For date search (format: yyyy-MM-dd)
  const [searchPaidTo, setSearchPaidTo] = useState(""); // For paidTo search

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

  // Handle form submission (Add or Update)
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

    if (editingExpense) {
      // Update existing expense
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpense.id
            ? {
                ...exp,
                date: parsedDate,
                category: formData.category,
                expenseDescription: formData.expenseDescription,
                amount: parseFloat(formData.amount),
                paidTo: formData.paidTo,
                paymentMode: formData.paymentMode,
              }
            : exp
        )
      );
      setEditingExpense(null);
    } else {
      // Add new expense
      setExpenses([
        ...expenses,
        {
          ...formData,
          date: parsedDate,
          amount: parseFloat(formData.amount),
          id: Date.now(),
        },
      ]);
    }

    // Reset form
    setFormData({
      date: today,
      category: isManualCategory ? "" : "Labor",
      expenseDescription: "",
      amount: "",
      paidTo: "",
      paymentMode: "Cash",
    });
    setIsManualDate(false);
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: format(new Date(expense.date), "dd MMMM yyyy"),
      category: expense.category,
      expenseDescription: expense.expenseDescription,
      amount: expense.amount,
      paidTo: expense.paidTo,
      paymentMode: expense.paymentMode,
    });
    setIsManualDate(true);
    setIsManualCategory(categories.includes(expense.category) ? false : true);
  };

  // Handle delete expense
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setExpenses(expenses.filter((exp) => exp.id !== id));
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
              ${filteredExpenses
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

  // Calculate monthly total expenses
  const calculateMonthlyTotal = () => {
    const filteredExpenses = expenses.filter((exp) => {
      const expenseDate = format(new Date(exp.date), "yyyy-MM");
      return expenseDate === selectedMonth;
    });
    return filteredExpenses.reduce((total, exp) => total + exp.amount, 0);
  };

  // Filter expenses based on search criteria
  const filteredExpenses = expenses.filter((exp) => {
    const matchesDate = searchDate
      ? format(new Date(exp.date), "yyyy-MM-dd") === searchDate
      : true;
    const matchesPaidTo = searchPaidTo
      ? exp.paidTo.toLowerCase().includes(searchPaidTo.toLowerCase())
      : true;
    return matchesDate && matchesPaidTo;
  });

  return (
    <div className="main-content">
      <div className="form-container">
        <h2>{editingExpense ? "Edit Expense" : "Add Expenses"}</h2>
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
              placeholder="Enter expense description (optional)"
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
              {editingExpense ? "Update Expense" : "Add Expense"}
            </button>
            {editingExpense && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingExpense(null);
                  setFormData({
                    date: today,
                    category: isManualCategory ? "" : "Labor",
                    expenseDescription: "",
                    amount: "",
                    paidTo: "",
                    paymentMode: "Cash",
                  });
                  setIsManualDate(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Monthly Total Expenses Section */}
      <div className="monthly-total-container">
        <h2>Monthly Total Expenses</h2>
        <div className="month-selector">
          <label>Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="total-expense">
          Total for {format(new Date(selectedMonth), "MMMM yyyy")}: ₹
          {calculateMonthlyTotal().toFixed(2)}
        </div>
      </div>

      {/* Expense Table */}
      <div className="table-container">
        <h2>Expense List</h2>
        <div className="table-actions">
          <div className="search-container">
            <div className="search-group">
              <label>Date:</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="search-group">
              <label>Paid To:</label>
              <input
                type="text"
                value={searchPaidTo}
                onChange={(e) => setSearchPaidTo(e.target.value)}
                placeholder="Search by recipient"
              />
            </div>
          </div>
          <button
            className="print-btn"
            onClick={handlePrint}
            disabled={filteredExpenses.length === 0}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7">No expenses found.</td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{format(new Date(expense.date), "dd MMMM yyyy")}</td>
                  <td>{expense.category}</td>
                  <td>{expense.expenseDescription}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td>{expense.paidTo}</td>
                  <td>{expense.paymentMode}</td>
                  <td style={{display:"flex"}}>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
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