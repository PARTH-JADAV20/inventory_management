import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from '../ShopContext/ShopContext';
import { parse, format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from "../api";
import "./ExpenseTracker.css";

const ExpenseTracker = () => {
  const today = format(new Date(), "dd-MM-yyyy");
  const { shop, setShop } = useContext(ShopContext)
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
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [searchDate, setSearchDate] = useState("");
  const [searchPaidTo, setSearchPaidTo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(null);
        const data = await fetchExpenses(shop, searchDate ? parseDateForAPI(searchDate) : '', searchPaidTo);
        setExpenses(data || []);
      } catch (err) {
        setError(`Error fetching expenses: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop, searchDate, searchPaidTo]);

  const handleShopChange = (e) => {
    setShop(e.target.value);
    setExpenses([]);
    setSearchDate("");
    setSearchPaidTo("");
    setSelectedMonth(format(new Date(), "yyyy-MM"));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "date" && value) {
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      if (!isNaN(parsed)) {
        setFormData({ ...formData, date: format(parsed, "dd-MM-yyyy") });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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

  const parseDateForAPI = (dateStr) => {
    try {
      const parsed = parse(dateStr, "dd-MM-yyyy", new Date());
      if (isNaN(parsed)) throw new Error("Invalid date");
      return format(parsed, "yyyy-MM-dd");
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.category ||
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
    const parsedDate = parseDateForAPI(formData.date);
    if (!parsedDate) {
      alert("Invalid date format. Use 'dd-mm-yyyy' (e.g., '24-04-2025')");
      return;
    }

    const expenseData = {
      date: parsedDate,
      category: formData.category,
      expenseDescription: formData.expenseDescription || "",
      amount: parseFloat(formData.amount),
      paidTo: formData.paidTo,
      paymentMode: formData.paymentMode,
    };

    try {
      setError(null);
      setLoading(true);
      if (editingExpense) {
        const updatedExpense = await updateExpense(shop, editingExpense.id, expenseData);
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
        );
        setEditingExpense(null);
      } else {
        const newExpense = await addExpense(shop, expenseData);
        setExpenses((prev) => [...prev, newExpense]);
      }
      setFormData({
        date: today,
        category: isManualCategory ? "" : "Labor",
        expenseDescription: "",
        amount: "",
        paidTo: "",
        paymentMode: "Cash",
      });
      setIsManualDate(false);
    } catch (err) {
      setError(`Error saving expense: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: format(new Date(expense.date), "dd-MM-yyyy"),
      category: expense.category,
      expenseDescription: expense.expenseDescription,
      amount: expense.amount,
      paidTo: expense.paidTo,
      paymentMode: expense.paymentMode,
    });
    setIsManualDate(true);
    setIsManualCategory(!categories.includes(expense.category));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      setError(null);
      setLoading(true);
      await deleteExpense(shop, id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err) {
      setError(`Error deleting expense: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Construction Expense Report - ${shop}</title>
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
          <h2>Construction Expense Report - ${shop}</h2>
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
                  <td>${format(new Date(exp.date), "dd-MM-yyyy")}</td>
                  <td>${exp.category}</td>
                  <td>${exp.expenseDescription || '-'}</td>
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

  const calculateMonthlyTotal = () => {
    const [year, month] = selectedMonth.split('-');
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    return expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= startOfMonth && expDate <= endOfMonth;
      })
      .reduce((total, exp) => total + (exp.amount || 0), 0);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesDate = searchDate
      ? format(new Date(exp.date), "dd-MM-yyyy") === searchDate
      : true;
    const matchesPaidTo = searchPaidTo
      ? exp.paidTo.toLowerCase().includes(searchPaidTo.toLowerCase())
      : true;
    const matchesMonth = selectedMonth
      ? format(new Date(exp.date), "yyyy-MM") === selectedMonth
      : true;
    return matchesDate && matchesPaidTo && matchesMonth;
  });

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
        <h2>{editingExpense ? "Edit Expense" : "Add Expenses"} for {shop}</h2>
        <form className="expense-form" onSubmit={handleSubmit}>
          {/* Rest of the form remains unchanged */}
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
            <label className="checkbox-label">
              <div>Category</div>
              <div className="checkbox-container-p">
                <input
                  type="checkbox"
                  name="isManualCategory"
                  checked={isManualCategory}
                  onChange={handleCheckboxChange}
                  disabled={loading}
                />
                Manual Input
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
                  disabled={loading}
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
                disabled={loading}
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
            <label>Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn" disabled={loading}>
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
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="monthly-total-container">
        <h2>Monthly Total Expenses - {shop}</h2>
        <div className="month-selector">
          <label>Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="total-expense">
          Total for {format(new Date(selectedMonth), "MMMM yyyy")}: ₹
          {calculateMonthlyTotal().toFixed(2)}
        </div>
      </div>

      <div className="table-container">
        <h2>Expense List - {shop}</h2>
        <div className="table-actions">
          <div className="search-container">
            <div className="search-group-p">
              <label>Date:</label>
              <input
                type="date"
                value={formatDateForPicker(searchDate)}
                onChange={(e) => {
                  const parsed = parse(e.target.value, "yyyy-MM-dd", new Date());
                  setSearchDate(isNaN(parsed) ? "" : format(parsed, "dd-MM-yyyy"));
                }}
                disabled={loading}
              />
            </div>
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
          <button
            className="print-btn"
            onClick={handlePrint}
            disabled={filteredExpenses.length === 0 || loading}
          >
            Print PDF
          </button>
        </div>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Sr.NO</th>
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
                <td colSpan="7">{loading ? "Loading..." : error ? error : "No expenses found."}</td>
              </tr>
            ) : (
              filteredExpenses.map((expense,index) => (
                <tr key={expense.id}>
                  <td style={{fontWeight:"bolder", color : "#ff6b2c"}}>{index+1}</td>
                  <td>{format(new Date(expense.date), "dd-MM-yyyy")}</td>
                  <td>{expense.category}</td>
                  <td>{expense.expenseDescription || '-'}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td>{expense.paidTo}</td>
                  <td>{expense.paymentMode}</td>
                  <td style={{ display: "flex" }}>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                      disabled={loading}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(expense.id)}
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
      </div>
    </div>
  );
};

export default ExpenseTracker;