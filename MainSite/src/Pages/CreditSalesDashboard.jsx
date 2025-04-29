import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Plus, Download, AlertCircle, CheckCircle } from "lucide-react";
import AddCreditSale from "../Components/CreditSales/AddCreditSale";
import CreditDetailsModal from "../Components/CreditSales/CreditDetailsModal";
import { fetchCreditSales, updateCreditSale } from "../Components/api"; // Adjust path to your api.js
import "./CreditSales.css";

const CreditSalesDashboard = ({ shop = "Shop 1" }) => {
  const [creditSales, setCreditSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStartOfMonth = (monthsBack) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    date.setDate(1);
    return date;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchCreditSales(shop);
      setCreditSales(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shop]);

  const filteredSales = creditSales.filter((sale) => {
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || sale.status === statusFilter;
    const matchesAmount =
      amountFilter === "All" ||
      (amountFilter === ">10000" && sale.totalAmount > 10000) ||
      (amountFilter === ">2months" &&
        (new Date() - new Date(sale.lastTransactionDate)) / (1000 * 60 * 60 * 24) > 60);
    const matchesTime =
      timeFilter === "All" ||
      (timeFilter === "This Month" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(0)) ||
      (timeFilter === "Last Month" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(1) &&
        new Date(sale.lastTransactionDate) < getStartOfMonth(0)) ||
      (timeFilter === "Last 2 Months" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(2));
    return matchesSearch && matchesStatus && matchesAmount && matchesTime;
  });

  const summary = {
    customers: new Set(
      creditSales
        .filter((sale) => sale.status !== "Cleared")
        .map((sale) => sale.customerName)
    ).size,
    totalCredit: creditSales
      .filter((sale) => sale.status !== "Cleared")
      .reduce((sum, sale) => sum + sale.totalAmount, 0),
  };

  const handleAddCredit = (newSale) => {
    setCreditSales([...creditSales, newSale]);
    setShowAddForm(false);
  };

  const handleUpdateCredit = async (updatedSale) => {
    setCreditSales(creditSales.map((sale) => (sale._id === updatedSale._id ? updatedSale : sale)));
    setSelectedCredit(null);
  };

  const handleQuickClose = async (sale) => {
    if (window.confirm(`Mark ₹${sale.totalAmount.toFixed(2)} for ${sale.customerName} as fully paid?`)) {
      setLoading(true);
      try {
        const updatedData = await updateCreditSale(shop, sale._id, { status: "Cleared" });
        handleUpdateCredit(updatedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Credit Sales Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h2 { color: #ff6b35; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #3a3a5a; padding: 10px; text-align: left; }
            th { background-color: #2b2b40; color: #a1a5b7; }
            td { background-color: #1e1e2d; color: #ffffff; }
            .overdue { color: #ff4444; }
          </style>
        </head>
        <body>
          <h2>Credit Sales Report</h2>
          <table>
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Credit (₹)</th>
                <th>Last Transaction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales
                .map(
                  (sale) => `
                <tr>
                  <td>${sale.billNumber}</td>
                  <td>${sale.customerName}</td>
                  <td>${sale.phoneNumber}</td>
                  <td>₹${sale.totalAmount.toFixed(2)}</td>
                  <td>${format(new Date(sale.lastTransactionDate), "dd MMMM yyyy")}</td>
                  <td>${sale.status}</td>
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

  const isOverdue = (date) => {
    const daysDiff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return daysDiff > 60;
  };

  const isHighCredit = (amount) => amount > 50000;

  return (
    <div className="main-content">
      <div className="summary-card">
        <div className="summary-item">
          <h3>Active Credit Customers</h3>
          <p>{loading ? "Loading..." : summary.customers}</p>
        </div>
        <div className="summary-item">
          <h3>Total Outstanding (₹)</h3>
          <p>{loading ? "Loading..." : `₹${summary.totalCredit.toFixed(2)}`}</p>
        </div>
      </div>
      <div className="form-container">
        <h2>Credit Sales Dashboard</h2>
        {error && <div className="warning">{error}</div>}
        <div className="table-actions">
          <div className="search-container">
            <div className="search-group">
              <label>Search:</label>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Customer name or phone"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="search-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                <option>All</option>
                <option>Open</option>
                <option>Cleared</option>
              </select>
            </div>
            <div className="search-group">
              <label>Amount/Time:</label>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                disabled={loading}
              >
                <option value="All">All</option>
                <option value=">10000">Credit &gt; ₹10,000</option>
                <option value=">2months">Overdue &gt; 2 Months</option>
              </select>
            </div>
            <div className="search-group">
              <label>Period:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                disabled={loading}
              >
                <option value="All">All Time</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="Last 2 Months">Last 2 Months</option>
              </select>
            </div>
          </div>
          <div>
            <button className="submit-btn" onClick={() => setShowAddForm(true)} disabled={loading}>
              <Plus size={16} /> Add Credit Sale
            </button>
            <button
              className="print-btn"
              onClick={handlePrint}
              disabled={filteredSales.length === 0 || loading}
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>
      {showAddForm && (
        <AddCreditSale
          onAdd={handleAddCredit}
          onCancel={() => setShowAddForm(false)}
          shop={shop}
        />
      )}
      {selectedCredit && (
        <CreditDetailsModal
          creditSale={selectedCredit}
          onUpdate={handleUpdateCredit}
          onClose={() => setSelectedCredit(null)}
          shop={shop}
        />
      )}
      <div className="table-container">
        <h2>Credit Sales List</h2>
        {loading && <div>Loading...</div>}
        <table className="expense-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total Credit (₹)</th>
              <th>Last Transaction</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 && !loading ? (
              <tr>
                <td colSpan="7">No credit sales found.</td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.billNumber}</td>
                  <td>
                    {sale.customerName}
                    {(isHighCredit(sale.totalAmount) || isOverdue(sale.lastTransactionDate)) && (
                      <span className="alert-badge">
                        <AlertCircle size={14} />
                      </span>
                    )}
                  </td>
                  <td>{sale.phoneNumber}</td>
                  <td>₹{sale.totalAmount.toFixed(2)}</td>
                  <td className={isOverdue(sale.lastTransactionDate) ? "overdue" : ""}>
                    {format(new Date(sale.lastTransactionDate), "dd MMMM yyyy")}
                  </td>
                  <td>{sale.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => setSelectedCredit(sale)}
                      title="View Details"
                      disabled={loading}
                    >
                      View
                    </button>
                    {sale.status !== "Cleared" && (
                      <button
                        className="edit-btn"
                        onClick={() => handleQuickClose(sale)}
                        title="Quick Close"
                        disabled={loading}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
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

export default CreditSalesDashboard;