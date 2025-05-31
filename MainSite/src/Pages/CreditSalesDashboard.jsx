import React, { useState, useEffect, useCallback, useContext } from "react";
import { format } from "date-fns";
import { Search, Plus, Download, AlertCircle, Undo, Delete } from "lucide-react";
import AddCreditSale from "../Components/CreditSales/AddCreditSale";
import CreditDetailsModal from "../Components/CreditSales/CreditDetailsModal";
import { fetchCreditSales, closeCreditSale, fetchCurrentStock, restoreCreditSale, permanentDeleteCreditSale } from "../Components/api";
import { ShopContext } from "../Components/ShopContext/ShopContext";
import "./CreditSales.css";

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const CreditSalesDashboard = () => {
  const { shop } = useContext(ShopContext);
  const [creditSales, setCreditSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showDeleted, setShowDeleted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("lastTransactionDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const getStartOfMonth = (monthsBack) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const fetchData = useCallback(
    async (search = "") => {
      setLoading(true);
      try {
        const [salesResponse, stockData] = await Promise.all([
          fetchCreditSales(shop, page, limit, sortBy, sortOrder, search.trim() || undefined, showDeleted),
          fetchCurrentStock(shop),
        ]);
        console.log("fetchCreditSales response:", salesResponse);
        const salesData = Array.isArray(salesResponse.data)
          ? salesResponse.data.map((sale) => ({
              ...sale,
              status: sale.status ?? "Unknown",
            }))
          : [];
        setCreditSales(salesData);
        setTotalPages(salesResponse.totalPages || 1);
        setStock(Array.isArray(stockData) ? stockData : []);
        setError("");
      } catch (err) {
        console.error("fetchData error:", err);
        setError(err.message || "Failed to fetch data");
        setCreditSales([]);
      } finally {
        setLoading(false);
      }
    },
    [shop, page, limit, sortBy, sortOrder, showDeleted]
  );

  const debouncedFetchData = useCallback(
    debounce((search) => {
      fetchData(search);
    }, 500),
    [fetchData]
  );

  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchData(value);
  };

  const filteredSales = creditSales.filter((sale) => {
    const matchesStatus = statusFilter === "All" || (sale.status ?? "Unknown") === statusFilter;
    const matchesAmount =
      amountFilter === "All" ||
      (amountFilter === ">10000" && (sale.totalAmount || 0) > 10000) ||
      (amountFilter === ">50000" && (sale.totalAmount || 0) > 50000) ||
      (amountFilter === ">2months" &&
        (new Date() - new Date(sale.lastTransactionDate)) / (1000 * 60 * 60 * 24) > 60);
    const matchesTime =
      timeFilter === "All" ||
      (timeFilter === "This Month" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(0)) ||
      (timeFilter === "Last Month" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(1) &&
        new Date(sale.lastTransactionDate) < getStartOfMonth(0)) ||
      (timeFilter === "Last 3 Months" &&
        new Date(sale.lastTransactionDate) >= getStartOfMonth(3));
    return matchesStatus && matchesAmount && matchesTime;
  });

  const summary = {
    customers: new Set(
      creditSales
        .filter((sale) => (sale.status ?? "Unknown") !== "Cleared" && !sale.isDeleted)
        .map((sale) => sale.customerName)
    ).size,
    totalCredit: creditSales
      .filter((sale) => (sale.status ?? "Unknown") !== "Cleared" && !sale.isDeleted)
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
    totalPaid: creditSales
      .filter((sale) => (sale.status ?? "Unknown") !== "Cleared" && !sale.isDeleted)
      .reduce((sum, sale) => sum + (sale.paidAmount || 0), 0),
    overdue: creditSales
      .filter(
        (sale) =>
          (sale.status ?? "Unknown") !== "Cleared" &&
          !sale.isDeleted &&
          (new Date() - new Date(sale.lastTransactionDate)) / (1000 * 60 * 60 * 24) > 60
      )
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
  };

  const handleAddCredit = async (newSale) => {
    setCreditSales([newSale, ...creditSales]);
    try {
      const updatedStock = await fetchCurrentStock(shop);
      setStock(Array.isArray(updatedStock) ? updatedStock : []);
    } catch (err) {
      setError(err.message || "Failed to update stock");
    }
    setShowAddForm(false);
  };

  const handleUpdateCredit = async (updatedSale) => {
    setCreditSales(creditSales.map((sale) => (sale._id === updatedSale._id ? updatedSale : sale)));
    setSelectedCredit(null);
  };

  const handleQuickClose = async (sale) => {
    if (
      window.confirm(
        `Mark ₹${(sale.totalAmount || 0).toFixed(2)} for ${sale.customerName} as fully paid?`
      )
    ) {
      setLoading(true);
      try {
        const updatedSale = await closeCreditSale(shop, sale._id, "Cleared");
        handleUpdateCredit(updatedSale);
      } catch (error) {
        setError(error.message || "Failed to close bill");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestore = async (sale) => {
    if (!window.confirm(`Restore credit sale for ${sale.customerName}?`)) return;
    setLoading(true);
    try {
      const updatedSale = await restoreCreditSale(shop, sale._id);
      handleUpdateCredit(updatedSale);
    } catch (error) {
      setError(error.message || "Failed to restore credit sale");
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (sale) => {
    if (!window.confirm(`Permanently delete credit sale for ${sale.customerName}? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      await permanentDeleteCreditSale(shop, sale._id);
      setCreditSales(creditSales.filter((s) => s._id !== sale._id));
    } catch (error) {
      setError(error.message || "Failed to permanently delete credit sale");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Credit Sales Report - ${shop}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333; }
            h2 { color: #ff6b35; }
            .summary-dax { margin-bottom: 20px; }
            .summary-dax p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
            th { background-color: #2b2b40; color: #ffffff; }
            td { background-color: #f9f9f9; }
            .overdue-dax { color: #ff4444; font-weight: bold; }
            .status-cleared-dax { color: #4caf50; }
            .status-open-dax { color: #ff6b35; }
            .status-deleted-dax { color: #ff4444; }
            .status-unknown-dax { color: #a1a5b7; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>Credit Sales Report - ${shop}</h2>
          <div class="summary-dax">
            <p><strong>Active Credit Customers:</strong> ${summary.customers}</p>
            <p><strong>Total Outstanding:</strong> ₹${summary.totalCredit.toFixed(2)}</p>
            <p><strong>Total Paid:</strong> ₹${summary.totalPaid.toFixed(2)}</p>
            <p><strong>Overdue (> 2 Months):</strong> ₹${summary.overdue.toFixed(2)}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Original Amount (₹)</th>
                <th>Paid Amount (₹)</th>
                <th>Remaining (₹)</th>
                <th>Last Transaction</th>
                <th>Status</th>
                <th>Deleted</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales
                .map(
                  (sale) => {
                    const lastTransactionDate = sale.lastTransactionDate && !isNaN(new Date(sale.lastTransactionDate).getTime())
                      ? format(new Date(sale.lastTransactionDate), "dd-MM-yyyy")
                      : "N/A";
                    return `
                    <tr>
                      <td>${sale.billNumber}</td>
                      <td>${sale.customerName}</td>
                      <td>${sale.phoneNumber}</td>
                      <td>₹${((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2)}</td>
                      <td>₹${(sale.paidAmount || 0).toFixed(2)}</td>
                      <td>₹${(sale.totalAmount || 0).toFixed(2)}</td>
                      <td class="${isOverdue(sale.lastTransactionDate) ? "overdue-dax" : ""}">${lastTransactionDate}</td>
                      <td class="status-${(sale.status ?? "Unknown").toLowerCase()}-dax">${sale.status ?? "Unknown"}</td>
                      <td class="${sale.isDeleted ? "status-deleted-dax" : ""}">${sale.isDeleted ? "Yes" : "No"}</td>
                    </tr>
                  `;
                  }
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

  const handleExportCSV = () => {
    const headers = [
      "Bill Number",
      "Customer",
      "Phone",
      "Original Amount (₹)",
      "Paid Amount (₹)",
      "Remaining (₹)",
      "Last Transaction",
      "Status",
      "Deleted",
    ];
    const rows = filteredSales.map((sale) => [
      sale.billNumber,
      sale.customerName,
      sale.phoneNumber,
      ((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2),
      (sale.paidAmount || 0).toFixed(2),
      (sale.totalAmount || 0).toFixed(2),
      sale.lastTransactionDate && !isNaN(new Date(sale.lastTransactionDate).getTime())
        ? format(new Date(sale.lastTransactionDate), "dd-MM-yyyy")
        : "N/A",
      sale.status ?? "Unknown",
      sale.isDeleted ? "Yes" : "No",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `credit_sales_${shop}_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
  };

  const isOverdue = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return false;
    const daysDiff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return daysDiff > 60;
  };

  const isHighCredit = (amount) => (amount || 0) > 50000;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="credit-sales-dashboard-dax">
      <h1>Credit Sales Dashboard</h1>
      <div className="summary-cards-dax">
        <div className="summary-card-dax">
          <h3>Active Credit Customers</h3>
          <p>{loading ? "Loading..." : summary.customers}</p>
        </div>
        <div className="summary-card-dax">
          <h3>Total Outstanding (₹)</h3>
          <p>{loading ? "Loading..." : `₹${summary.totalCredit.toFixed(2)}`}</p>
        </div>
        <div className="summary-card-dax">
          <h3>Total Paid (₹)</h3>
          <p>{loading ? "Loading..." : `₹${summary.totalPaid.toFixed(2)}`}</p>
        </div>
        <div className="summary-card-dax">
          <h3>Overdue (&gt; 2 Months)</h3>
          <p>{loading ? "Loading..." : `₹${summary.overdue.toFixed(2)}`}</p>
        </div>
      </div>
      {error && (
        <div className="error-message-dax">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      <div className="filters-and-actions-dax">
        <div className="filters-dax">
          <div className="filter-group-dax">
            <label>Search:</label>
            <div className="search-input-wrapper-dax">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Bill, customer, or phone"
                disabled={loading}
              />
            </div>
          </div>
          <div className="filter-group-dax">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={loading}
            >
              <option>All</option>
              <option>Open</option>
              <option>Cleared</option>
              <option>Unknown</option>
            </select>
          </div>
          <div className="filter-group-dax">
            <label>Amount/Time:</label>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              disabled={loading}
            >
              <option value="All">All</option>
              <option value=">10000">Credit &gt; ₹10,000</option>
              <option value=">50000">Credit &gt; ₹50,000</option>
              <option value=">2months">Overdue &gt; 2 Months</option>
            </select>
          </div>
          <div className="filter-group-dax">
            <label>Period:</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              disabled={loading}
            >
              <option value="All">All Time</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
          </div>
          <div className="filter-group-dax checkbox-group-dax">
            <label>Show Deleted:</label>
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="actions-dax">
          <button
            className="add-btn-dax"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
          >
            <Plus size={16} /> Add Credit Sale
          </button>
          <button
            className="print-btn-dax"
            onClick={handlePrint}
            disabled={filteredSales.length === 0 || loading}
          >
            <Download size={16} /> Print Report
          </button>
          <button
            className="export-btn-dax"
            onClick={handleExportCSV}
            disabled={filteredSales.length === 0 || loading}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
      <div className="pagination-dax">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="pagination-btn-dax"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="pagination-btn-dax"
        >
          Next
        </button>
      </div>
      {loading ? (
        <div className="loading-dax">Loading...</div>
      ) : filteredSales.length === 0 ? (
        <div className="no-data-dax">No credit sales found</div>
      ) : (
        <div className="table-container-dax">
          <table className="credit-sales-table-dax">
            <thead>
              <tr>
                <th onClick={() => handleSort("billNumber")}>
                  Bill Number {sortBy === "billNumber" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("customerName")}>
                  Customer {sortBy === "customerName" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("phoneNumber")}>
                  Phone {sortBy === "phoneNumber" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("totalAmount")}>
                  Original Amount (₹) {sortBy === "totalAmount" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Paid Amount (₹)</th>
                <th>Remaining (₹)</th>
                <th onClick={() => handleSort("lastTransactionDate")}>
                  Last Transaction{" "}
                  {sortBy === "lastTransactionDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale._id}
                  className={isHighCredit(sale.totalAmount) ? "high-credit-dax" : ""}
                >
                  <td>{sale.billNumber}</td>
                  <td>{sale.customerName}</td>
                  <td>{sale.phoneNumber}</td>
                  <td>₹{((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2)}</td>
                  <td>₹{(sale.paidAmount || 0).toFixed(2)}</td>
                  <td>₹{(sale.totalAmount || 0).toFixed(2)}</td>
                  <td
                    className={isOverdue(sale.lastTransactionDate) ? "overdue-dax" : ""}
                  >
                    {sale.lastTransactionDate && !isNaN(new Date(sale.lastTransactionDate).getTime())
                      ? format(new Date(sale.lastTransactionDate), "dd-MM-yyyy")
                      : "N/A"}
                  </td>
                  <td className={`status-${(sale.status ?? "Unknown").toLowerCase()}-dax`}>
                    {sale.status ?? "Unknown"}
                  </td>
                  <td className={sale.isDeleted ? "status-deleted-dax" : ""}>
                    {sale.isDeleted ? "Yes" : "No"}
                  </td>
                  <td>
                    <div className="action-buttons-dax">
                      <button
                        className="view-btn-dax"
                        onClick={() => setSelectedCredit(sale)}
                        disabled={loading}
                      >
                        View Details
                      </button>
                      {(sale.status ?? "Unknown") !== "Cleared" && !sale.isDeleted && (
                        <button
                          className="quick-close-btn-dax"
                          onClick={() => handleQuickClose(sale)}
                          disabled={loading}
                        >
                          Quick Close
                        </button>
                      )}
                      {sale.isDeleted && (
                        <>
                          <button
                            className="restore-btn-dax"
                            onClick={() => handleRestore(sale)}
                            disabled={loading}
                          >
                            <Undo size={16} /> Restore
                          </button>
                          <button
                            className="delete-btn-dax"
                            onClick={() => handlePermanentDelete(sale)}
                            disabled={loading}
                          >
                            <Delete size={16} /> Permanent Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAddForm && (
        <AddCreditSale
          onAdd={handleAddCredit}
          onCancel={() => setShowAddForm(false)}
          shop={shop}
          stock={stock}
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
    </div>
  );
};

export default CreditSalesDashboard;