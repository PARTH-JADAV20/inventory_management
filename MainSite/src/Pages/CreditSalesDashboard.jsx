import React, { useState } from "react";
import { format } from "date-fns";
import { Search, Plus, Download, AlertCircle, CheckCircle } from "lucide-react";
import AddCreditSale from "../Components/CreditSales/AddCreditSale";
import CreditDetailsModal from "../Components/CreditSales/CreditDetailsModal";
import "./CreditSales.css";

const CreditSalesDashboard = () => {
  const [creditSales, setCreditSales] = useState([
    {
      id: 1,
      customerName: "Amit Sharma",
      phone: "9876543210",
      totalCredit: 25000,
      lastTransaction: "2025-04-20",
      status: "Open",
      items: [
        { product: "Cement (Ambuja)", qty: 50, unit: "Bag", pricePerUnit: 400, date: "2025-04-20" },
        { product: "Sand", qty: 2, unit: "Truck", pricePerUnit: 5000, date: "2025-04-20" },
      ],
    },
    {
      id: 2,
      customerName: "Rajesh Patel",
      phone: "8765432109",
      totalCredit: 15000,
      lastTransaction: "2025-04-18",
      status: "Partially Paid",
      items: [
        { product: "Steel Rod (Tata)", qty: 100, unit: "Kg", pricePerUnit: 150, date: "2025-04-18" },
      ],
      payments: [{ amount: 5000, date: "2025-04-19", mode: "Cash" }],
    },
    {
      id: 3,
      customerName: "Vikram Singh",
      phone: "7654321098",
      totalCredit: 10000,
      lastTransaction: "2025-03-15",
      status: "Manually Closed",
      items: [
        { product: "Bricks", qty: 1000, unit: "Piece", pricePerUnit: 10, date: "2025-03-15" },
      ],
      payments: [{ amount: 8000, date: "2025-03-20", mode: "UPI", note: "Settled at ₹8000" }],
    },
    {
      id: 4,
      customerName: "Suresh Kumar",
      phone: "6543210987",
      totalCredit: 60000,
      lastTransaction: "2025-02-10",
      status: "Open",
      items: [
        { product: "Cement (UltraTech)", qty: 100, unit: "Bag", pricePerUnit: 450, date: "2025-02-10" },
        { product: "Steel Rod (Tata)", qty: 200, unit: "Kg", pricePerUnit: 150, date: "2025-02-10" },
      ],
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);

  const getStartOfMonth = (monthsBack) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    date.setDate(1);
    return date;
  };

  const filteredSales = creditSales.filter((sale) => {
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || sale.status === statusFilter;
    const matchesAmount =
      amountFilter === "All" ||
      (amountFilter === ">10000" && sale.totalCredit > 10000) ||
      (amountFilter === ">2months" &&
        (new Date() - new Date(sale.lastTransaction)) / (1000 * 60 * 60 * 24) > 60);
    const matchesTime =
      timeFilter === "All" ||
      (timeFilter === "This Month" &&
        new Date(sale.lastTransaction) >= getStartOfMonth(0)) ||
      (timeFilter === "Last Month" &&
        new Date(sale.lastTransaction) >= getStartOfMonth(1) &&
        new Date(sale.lastTransaction) < getStartOfMonth(0)) ||
      (timeFilter === "Last 2 Months" &&
        new Date(sale.lastTransaction) >= getStartOfMonth(2));
    return matchesSearch && matchesStatus && matchesAmount && matchesTime;
  });

  const summary = {
    customers: new Set(
      creditSales
        .filter((sale) => sale.status !== "Closed" && sale.status !== "Manually Closed")
        .map((sale) => sale.customerName)
    ).size,
    totalCredit: creditSales
      .filter((sale) => sale.status !== "Closed" && sale.status !== "Manually Closed")
      .reduce((sum, sale) => sum + sale.totalCredit, 0),
  };

  const handleAddCredit = (newSale) => {
    setCreditSales([...creditSales, { ...newSale, id: Date.now() }]);
    setShowAddForm(false);
  };

  const handleUpdateCredit = (updatedSale) => {
    setCreditSales(creditSales.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale)));
    setSelectedCredit(null);
  };

  const handleQuickClose = (sale) => {
    if (window.confirm(`Mark ₹${sale.totalCredit.toFixed(2)} for ${sale.customerName} as fully paid?`)) {
      const updatedSale = {
        ...sale,
        totalCredit: 0,
        status: "Closed",
        payments: [
          ...(sale.payments || []),
          {
            amount: sale.totalCredit,
            date: new Date().toISOString().split("T")[0],
            mode: "Cash",
            note: "Quick close",
          },
        ],
      };
      handleUpdateCredit(updatedSale);
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
                  <td>${sale.customerName}</td>
                  <td>${sale.phone}</td>
                  <td>₹${sale.totalCredit.toFixed(2)}</td>
                  <td>${format(new Date(sale.lastTransaction), "dd MMMM yyyy")}</td>
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
          <p>{summary.customers}</p>
        </div>
        <div className="summary-item">
          <h3>Total Outstanding (₹)</h3>
          <p>₹{summary.totalCredit.toFixed(2)}</p>
        </div>
      </div>
      <div className="form-container">
        <h2>Credit Sales Dashboard</h2>
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
                />
              </div>
            </div>
            <div className="search-group">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>Partially Paid</option>
                <option>Closed</option>
                <option>Manually Closed</option>
              </select>
            </div>
            <div className="search-group">
              <label>Amount/Time:</label>
              <select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value=">10000">Credit `&gt` ₹10,000</option>
                <option value=">2months">Overdue `&gt` 2 Months</option>
              </select>
            </div>
            <div className="search-group">
              <label>Period:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="All">All Time</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="Last 2 Months">Last 2 Months</option>
              </select>
            </div>
          </div>
          <div>
            <button className="submit-btn" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Add Credit Sale
            </button>
            <button
              className="print-btn"
              onClick={handlePrint}
              disabled={filteredSales.length === 0}
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
          existingCustomers={creditSales.map((sale) => ({
            name: sale.customerName,
            phone: sale.phone,
          }))}
        />
      )}
      {selectedCredit && (
        <CreditDetailsModal
          creditSale={selectedCredit}
          onUpdate={handleUpdateCredit}
          onClose={() => setSelectedCredit(null)}
        />
      )}
      <div className="table-container">
        <h2>Credit Sales List</h2>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total Credit (₹)</th>
              <th>Last Transaction</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="6">No credit sales found.</td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    {sale.customerName}
                    {(isHighCredit(sale.totalCredit) || isOverdue(sale.lastTransaction)) && (
                      <span className="alert-badge">
                        <AlertCircle size={14} />
                      </span>
                    )}
                  </td>
                  <td>{sale.phone}</td>
                  <td>₹{sale.totalCredit.toFixed(2)}</td>
                  <td className={isOverdue(sale.lastTransaction) ? "overdue" : ""}>
                    {format(new Date(sale.lastTransaction), "dd MMMM yyyy")}
                  </td>
                  <td>{sale.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => setSelectedCredit(sale)}
                      title="View Details"
                    >
                      View
                    </button>
                    {sale.status !== "Closed" && sale.status !== "Manually Closed" && (
                      <button
                        className="edit-btn"
                        onClick={() => handleQuickClose(sale)}
                        title="Quick Close"
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