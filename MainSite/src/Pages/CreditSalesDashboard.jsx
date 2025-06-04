import React, { useState, useEffect, useCallback, useContext } from "react";
import { format, parse } from "date-fns";
import { Search, Plus, Download, AlertCircle, Undo, Delete, Trash2 } from "lucide-react";
import AddCreditSale from "../Components/CreditSales/AddCreditSale";
import AddOldCreditSale from "../Components/CreditSales/AddOldCreditSale";
import CreditDetailsModal from "../Components/CreditSales/CreditDetailsModal";
import ClearedTrashedBillsModal from "../Components/CreditSales/ClearedTrashedBillsModal";
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
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOutstanding: 0,
    totalPaid: 0,
    totalOverdue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showDeleted, setShowDeleted] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddOldForm, setShowAddOldForm] = useState(false);
  const [showClearedTrashedModal, setShowClearedTrashedModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
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

  const formatDate = (dateStr) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) return "N/A";
    // Try parsing as DD-MM-YYYY first (since database stores this)
    try {
      const parsedDate = parse(dateStr, "dd-MM-yyyy", new Date());
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, "d MMMM yyyy");
      }
    } catch {
      // Fallback to parsing as ISO or other formats
      return format(new Date(dateStr), "d MMMM yyyy");
    }
    return "N/A";
  };

  const fetchData = useCallback(
    async (search = "") => {
      setLoading(true);
      try {
        const [salesResponse, stockData] = await Promise.all([
          fetchCreditSales(shop, page, limit, sortBy, sortOrder, search.trim() || undefined, showDeleted, showOld),
          fetchCurrentStock(shop),
        ]);

        // Process sales data
        let salesData = Array.isArray(salesResponse.data)
          ? salesResponse.data.map((sale) => ({
              ...sale,
              status: sale.status ?? "Unknown",
              isOld: sale.isOld ?? false,
            }))
          : [];
        
        // Filter old bills if showOld is true
        if (showOld) {
          salesData = salesData.filter(sale => sale.isOld === true);
        }

        setCreditSales(salesData);
        setTotalPages(salesResponse.totalPages || 1);
        setStock(Array.isArray(stockData) ? stockData : []);

        // Fetch stats (full dataset for global stats, excluding deleted)
        const allSalesResponse = await fetchCreditSales(shop, 1, 999999, "lastTransactionDate", "desc", undefined, false, true);
        const allSales = Array.isArray(allSalesResponse.data) ? allSalesResponse.data : [];
        
        const uniqueCustomers = new Set(allSales.map(sale => sale.phoneNumber)).size;
        const totalOutstanding = allSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const totalPaid = allSales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
        const totalOverdue = allSales.reduce((sum, sale) => {
          if (isOverdue(sale.lastTransactionDate, sale.totalAmount)) {
            return sum + (sale.totalAmount || 0);
          }
          return sum;
        }, 0);

        setStats({
          totalCustomers: uniqueCustomers,
          totalOutstanding,
          totalPaid,
          totalOverdue,
        });

        setError("");
      } catch (err) {
        console.error("fetchData error:", err);
        setError(err.message || "Failed to fetch data");
        setCreditSales([]);
        setStats({ totalCustomers: 0, totalOutstanding: 0, totalPaid: 0, totalOverdue: 0 });
      } finally {
        setLoading(false);
      }
    },
    [shop, page, sortBy, sortOrder, showDeleted, showOld]
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
    setPage(1);
  };

  const filteredSales = creditSales.filter((sale) => {
    const matchesStatus = statusFilter === "All" || (sale.status ?? "Unknown") === statusFilter;
    const matchesAmount =
      amountFilter === "All" ||
      (amountFilter === ">10000" && (sale.totalAmount || 0) > 10000) ||
      (amountFilter === ">50000" && (sale.totalAmount || 0) > 50000) ||
      (amountFilter === ">2months" &&
        (new Date() - new Date(sale.lastTransactionDate)) / (1000 * 60 * 60 * 24) >= 60 &&
        (sale.totalAmount || 0) > 0);
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

  const handleAddCredit = async (newSale) => {
    setCreditSales([newSale, ...creditSales]);
    try {
      const updatedStock = await fetchCurrentStock(shop);
      setStock(Array.isArray(updatedStock) ? updatedStock : []);
      await fetchData(searchTerm); // Refresh stats
    } catch (err) {
      setError(err.message || "Failed to update stock");
    }
    setShowAddForm(false);
  };

  const handleAddOldCredit = async (newSale) => {
    setCreditSales([newSale, ...creditSales]);
    await fetchData(searchTerm); // Refresh stats
    setShowAddOldForm(false);
  };

  const handleUpdateCredit = async (updatedSale) => {
    setCreditSales(creditSales.map((sale) => (sale._id === updatedSale._id ? updatedSale : sale)));
    await fetchData(searchTerm); // Refresh stats
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
        const updatedSale = await closeCreditSale(shop, sale._id);
        await handleUpdateCredit(updatedSale);
        await fetchData(searchTerm); // Refresh stats
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
      await handleUpdateCredit(updatedSale);
      await fetchData(searchTerm); // Refresh stats
    } catch (error) {
      setError(error.message || "Failed to restore credit");
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
      await fetchData(searchTerm); // Refresh stats
    } catch (error) {
      setError(error.message || "Failed to permanently delete credit");
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
            .stats { margin-bottom: 20px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
            th { background-color: #2b2b40; color: #ffffff; }
            td { background-color: #f9f9f9; }
            .overdue-dax { color: #ff4444; font-weight: bold; }
            .status-cleared-dax { color: #4caf50; }
            .status-open-dax { color: #ff6b35; }
            .status-deleted-dax { color: #ff4444; }
            .status-unknown-dax { color: #a1a5b7; }
            .sr-no-dax { color: #ff6b35; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>Credit Sales Report - ${shop}</h2>
          <div class="stats">
            <p>Total Customers: ${stats.totalCustomers}</p>
            <p>Total Outstanding: ₹${stats.totalOutstanding.toFixed(2)}</p>
            <p>Total Paid: ₹${stats.totalPaid.toFixed(2)}</p>
            <p>Total Overdue (>2 Months): ₹${stats.totalOverdue.toFixed(2)}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SR No</th>
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
                  (sale, index) => {
                    const lastTransactionDate = formatDate(sale.lastTransactionDate);
                    return `
                      <tr>
                        <td class="sr-no-dax">${index + 1}</td>
                        <td>${sale.billNumber}</td>
                        <td>${sale.customerName}</td>
                        <td>${sale.phoneNumber}</td>
                        <td>₹${((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2)}</td>
                        <td>₹${(sale.paidAmount || 0).toFixed(2)}</td>
                        <td>₹${(sale.totalAmount || 0).toFixed(2)}</td>
                        <td class="${isOverdue(sale.lastTransactionDate, sale.totalAmount) ? "overdue-dax" : ""}">${lastTransactionDate}</td>
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
      "SR No",
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
    const rows = filteredSales.map((sale, index) => [
      index + 1,
      sale.billNumber,
      sale.customerName,
      sale.phoneNumber,
      ((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2),
      (sale.paidAmount || 0).toFixed(2),
      (sale.totalAmount || 0).toFixed(2),
      formatDate(sale.lastTransactionDate),
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
    link.download = `credit_sales_${shop}_${format(new Date(), "d MMMM yyyy")}.csv`;
    link.click();
  };

  const isOverdue = (date, totalAmount) => {
    if (!date || isNaN(new Date(date).getTime()) || (totalAmount || 0) <= 0) return false;
    const daysDiff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return daysDiff >= 60;
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
      <div className="stats-container-dax">
        <div className="stat-box-dax">
          <span className="stat-label-dax">Total Customers</span>
          <span className="stat-value-dax">{stats.totalCustomers}</span>
        </div>
        <div className="stat-box-dax">
          <span className="stat-label-dax">Total Outstanding</span>
          <span className="stat-value-dax">₹{stats.totalOutstanding.toFixed(2)}</span>
        </div>
        <div className="stat-box-dax">
          <span className="stat-label-dax">Total Paid</span>
          <span className="stat-value-dax">₹{stats.totalPaid.toFixed(2)}</span>
        </div>
        <div className="stat-box-dax">
          <span className="stat-label-dax">Total Overdue (>2 Months)</span>
          <span className="stat-value-dax">₹{stats.totalOverdue.toFixed(2)}</span>
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
              <option value=">10000">Credit > ₹10,000</option>
              <option value=">50000">Credit > ₹50,000</option>
              <option value=">2months">Overdue > 2 Months</option>
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
          <div className="filter-group-dax checkbox-group-dax">
            <label>Show Old Bills:</label>
            <input
              type="checkbox"
              checked={showOld}
              onChange={(e) => {
                setShowOld(e.target.checked);
                fetchData(searchTerm); // Refresh data when toggled
              }}
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
            className="add-old-btn-dax"
            onClick={() => setShowAddOldForm(true)}
            disabled={loading}
          >
            <Plus size={16} /> Add Old Bill
          </button>
          <button
            className="view-cleared-trashed-btn-dax"
            onClick={() => setShowClearedTrashedModal(true)}
            disabled={loading}
          >
            <Trash2 size={16} /> View Cleared & Trashed Bills
          </button>
          <button
            className="print-btn-dax"
            onClick={handlePrint}
            disabled={filteredSales.length === 0 || loading}
          >
            <Download size={16} /> Print
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
        <span>Page {page} of {totalPages}</span>
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
      ) : creditSales.length === 0 ? (
        <div className="no-data-dax">No credit sales found.</div>
      ) : (
        <div className="table-container-dax">
          <table className="credit-sales-table-dax">
            <thead>
              <tr>
                <th>SR No</th>
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
                  Last Transaction {sortBy === "lastTransactionDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <tr
                  key={sale._id}
                  className={isHighCredit(sale.totalAmount) ? "high-credit-dax" : ""}
                >
                  <td className="sr-no-dax">{index + 1}</td>
                  <td>{sale.billNumber}</td>
                  <td>{sale.customerName}</td>
                  <td>{sale.phoneNumber}</td>
                  <td>₹{((sale.totalAmount || 0) + (sale.paidAmount || 0)).toFixed(2)}</td>
                  <td>₹{(sale.paidAmount || 0).toFixed(2)}</td>
                  <td>₹{(sale.totalAmount || 0).toFixed(2)}</td>
                  <td className={isOverdue(sale.lastTransactionDate, sale.totalAmount) ? "overdue-dax" : ""}>
                    {formatDate(sale.lastTransactionDate)}
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
      {showAddOldForm && (
        <AddOldCreditSale
          onAdd={handleAddOldCredit}
          onCancel={() => setShowAddOldForm(false)}
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
      {showClearedTrashedModal && (
        <ClearedTrashedBillsModal
          shop={shop}
          onClose={() => setShowClearedTrashedModal(false)}
        />
      )}
    </div>
  );
};

export default CreditSalesDashboard;