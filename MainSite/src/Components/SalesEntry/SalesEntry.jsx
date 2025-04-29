import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fetchStock, fetchCurrentStock, fetchCustomers, createSale, fetchSales, deleteSale } from "../api.js";
import "./SalesEntry.css";

// Function to format date to DD-MM-YYYY
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const SalesEntry = () => {
  const [customers, setCustomers] = useState([]); // Shop 1 & 2 customers fetched from backend
  const [stock, setStock] = useState([]); // Stock fetched from backend
  const [groupedStock, setGroupedStock] = useState([]); // Grouped stock from fetchCurrentStock
  const [sales, setSales] = useState([]); // Sales fetched from backend
  const [shop, setShop] = useState("Shop 1"); // Active shop
  const [newSale, setNewSale] = useState({
    billNo: "", // Backend generates billNo
    date: formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]), // Store as DD-MM-YYYY
    profileName: "",
    phoneNumber: "",
    paymentType: "Cash",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    product: "",
    qty: "",
    unit: "",
    pricePerQty: "",
    category: "", // Added to track category for grouping
  });
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [warning, setWarning] = useState("");
  const [isBillNoEditable, setIsBillNoEditable] = useState(false);
  const [isDateEditable, setIsDateEditable] = useState(false);
  const [isItemSearchManual, setIsItemSearchManual] = useState(false);
  const [advanceSearchTerm, setAdvanceSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added for API loading state

  // Fetch stock, customers, and sales on shop change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        setWarning("");
        // Fetch stock
        const stockData = await fetchStock(shop);
        setStock(stockData);

        // Fetch grouped stock for dropdown
        const groupedStockData = await fetchCurrentStock(shop);
        setGroupedStock(groupedStockData);

        // Fetch customers
        const customerData = await fetchCustomers(shop);
        setCustomers(customerData);

        // Fetch sales
        const salesData = await fetchSales(shop);
        setSales(salesData);
      } catch (err) {
        setWarning(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [shop]);

  // Refresh sales when filterDate or searchTerm changes
  useEffect(() => {
    const loadSales = async () => {
      setIsLoading(true);
      try {
        setWarning("");
        const salesData = await fetchSales(shop, filterDate, searchTerm);
        setSales(salesData);
      } catch (err) {
        setWarning(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, [shop, filterDate, searchTerm]);

  // Group stock items by name, category, and unit (for dropdown)
  const getGroupedStock = () => {
    return groupedStock.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "date") {
      setNewSale((prev) => ({
        ...prev,
        [name]: formatDateToDDMMYYYY(value),
      }));
    } else {
      setNewSale((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle payment type change
  const handlePaymentTypeChange = (e) => {
    const paymentType = e.target.value;
    setNewSale((prev) => ({ ...prev, paymentType }));
    if (paymentType === "Advance") {
      setAdvanceSearchTerm("");
    }
  };

  // Handle advance profile selection
  const handleAdvanceProfileSelect = (e) => {
    const value = e.target.value;
    const match = value.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const profileName = match[1].trim();
      const phoneNumber = match[2].trim();
      setNewSale((prev) => ({
        ...prev,
        profileName,
        phoneNumber,
      }));
      setAdvanceSearchTerm(value);
    } else {
      setAdvanceSearchTerm(value);
    }
  };

  // Handle item input changes
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    if (name === "product") {
      const selectedItem = groupedStock.find((item) => item.name === value);
      setCurrentItem((prev) => ({
        ...prev,
        product: value,
        unit: selectedItem ? selectedItem.unit : "",
        pricePerQty: selectedItem ? selectedItem.price : "",
        category: selectedItem ? selectedItem.category : "",
      }));
    } else {
      setCurrentItem((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Toggle bill no editability and reset if unchecked
  const toggleBillNoEditable = () => {
    setIsBillNoEditable((prev) => {
      if (prev) {
        setNewSale((prevSale) => ({
          ...prevSale,
          billNo: "", // Backend will generate
        }));
      }
      return !prev;
    });
  };

  // Toggle date editability and reset if unchecked
  const toggleDateEditable = () => {
    setIsDateEditable((prev) => {
      if (prev) {
        setNewSale((prevSale) => ({
          ...prevSale,
          date: formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]),
        }));
      }
      return !prev;
    });
  };

  // Add item to sale
  const addItemToSale = () => {
    if (!currentItem.product || !currentItem.qty || !currentItem.unit || !currentItem.pricePerQty) {
      alert("Please fill all item fields, including unit and price");
      return;
    }

    const qty = parseFloat(currentItem.qty);
    const pricePerQty = parseFloat(currentItem.pricePerQty);
    const amount = qty * pricePerQty;

    const stockItem = groupedStock.find(
      (item) =>
        item.name === currentItem.product &&
        item.category === currentItem.category &&
        item.unit === currentItem.unit
    );

    if (!stockItem || stockItem.quantity < qty) {
      alert("Insufficient stock or invalid product");
      return;
    }

    if (!isCustomUnit && stockItem.unit !== currentItem.unit) {
      alert("Unit mismatch with stock item");
      return;
    }

    setNewSale((prev) => ({
      ...prev,
      items: [...prev.items, { ...currentItem, qty, pricePerQty, amount }],
    }));
    setCurrentItem({ product: "", qty: "", unit: "", pricePerQty: "", category: "" });
    setIsCustomUnit(false);
  };

  // Remove item from sale
  const removeItem = (index) => {
    setNewSale((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      if (updatedItems.length === 0) {
        setIsCustomUnit(false);
      }
      return { ...prev, items: updatedItems };
    });
  };

  // Calculate average price for a product
  const getAveragePrice = (product, category, unit) => {
    const stockItem = groupedStock.find(
      (item) => item.name === product && item.category === category && item.unit === unit
    );
    return stockItem ? stockItem.price.toFixed(2) : "0.00";
  };

  // Delete a sale
  const handleDeleteSale = async (billNo, profileId, phoneNumber, items) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    setIsLoading(true);
    try {
      setWarning("");
      await deleteSale(shop, billNo, profileId, phoneNumber, items); // Use backend deleteSale
      // Refresh stock, customers, and sales
      const [stockData, groupedStockData, customerData, salesData] = await Promise.all([
        fetchStock(shop),
        fetchCurrentStock(shop),
        fetchCustomers(shop),
        fetchSales(shop, filterDate, searchTerm),
      ]);
      setStock(stockData);
      setGroupedStock(groupedStockData);
      setCustomers(customerData);
      setSales(salesData);
    } catch (err) {
      setWarning(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save sale
  const saveSale = async () => {
    if (!newSale.profileName || !newSale.phoneNumber) {
      setWarning("Please enter both profile name and phone number");
      return false;
    }

    if (newSale.items.length === 0) {
      setWarning("Please add at least one item to the sale");
      return false;
    }

    setIsLoading(true);
    try {
      setWarning("");
      const saleData = {
        profileName: newSale.profileName,
        phoneNumber: newSale.phoneNumber,
        paymentType: newSale.paymentType,
        items: newSale.items,
        date: newSale.date,
      };
      const response = await createSale(shop, saleData); // Use backend createSale
      const { bill, customer } = response;

      // Update local state
      setStock(await fetchStock(shop));
      setGroupedStock(await fetchCurrentStock(shop));
      setCustomers((prev) =>
        prev.map((c) =>
          c.phoneNumber === customer.phoneNumber ? customer : c
        ).concat(customer.phoneNumber && !prev.some(c => c.phoneNumber === customer.phoneNumber) ? [customer] : [])
      );
      setSales(await fetchSales(shop, filterDate, searchTerm));

      // Reset form
      setNewSale({
        billNo: "", // Backend will generate
        date: formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]),
        profileName: "",
        phoneNumber: "",
        paymentType: "Cash",
        items: [],
      });
      setAdvanceSearchTerm("");
      return bill; // Return bill for generate bill functions
    } catch (err) {
      setWarning(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sale Entry
  const handleSaleEntry = async () => {
    await saveSale();
  };

  // Handle Generate Bill and Sale Entry
  const handleGenerateBillAndSale = async () => {
    const bill = await saveSale();
    if (bill) {
      handlePrintBill(bill, newSale.paymentType, newSale.profileName, newSale.phoneNumber);
    }
  };

  // Handle Generate Bill
  const handleGenerateBill = async () => {
    const bill = await saveSale();
    if (bill) {
      handlePrintBill(bill, newSale.paymentType, newSale.profileName, newSale.phoneNumber);
    }
  };

  // Print bill
  const handlePrintBill = (bill, paymentType, profileName, phoneNumber) => {
    const printWindow = window.open("", "_blank");
    let billContent = `
      <html>
        <head>
          <title>Bill ${bill.billNo}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h2 { color: #ff6b35; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #3a3a5a; padding: 10px; text-align: left; }
            th { background-color: #2b2b40; color: #a1a5b7; }
            td { background-color: #1e1e2d; color: #ffffff; }
            .total { font-weight: bold; }
            .payment-method { margin-top: 10px; font-style: italic; }
          </style>
        </head>
        <body>
          <h2>Bill No: ${bill.billNo}</h2>
          <p>Profile Name: ${profileName}</p>
          <p>Phone Number: ${phoneNumber}</p>
          <p>Date: ${bill.date}</p>
          <p className="payment-method">Payment Method: ${paymentMethod}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price/Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.product}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.pricePerQty}</td>
                  <td>₹${item.amount}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total">
                <td colspan="3">Total Amount</td>
                <td>₹${bill.totalAmount}</td>
              </tr>
    `;

    if (bill.advanceRemaining !== null && bill.advanceRemaining >= 0) {
      billContent += `
              <tr class="total">
                <td colspan="3">Advance Remaining</td>
                <td>₹${bill.advanceRemaining}</td>
              </tr>
            `;
    }

    if (bill.creditAmount) {
      billContent += `
              <tr class="total">
                <td colspan="3">Credit Amount</td>
                <td>₹${bill.creditAmount}</td>
              </tr>
            `;
    }

    billContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setFilterDate(formatDateToDDMMYYYY(e.target.value));
  };

  // Handle search term change
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get all sales for display
  const allSales = sales
    .filter((sale) =>
      filterDate
        ? sale.date === filterDate
        : true
    )
    .filter((sale) =>
      searchTerm
        ? sale.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.phoneNumber.includes(searchTerm)
        : true
    );

  // Group sales by date
  const salesByDate = allSales.reduce((acc, sale) => {
    if (!acc[sale.date]) {
      acc[sale.date] = [];
    }
    acc[sale.date].push(sale);
    return acc;
  }, {});

  // Sort dates in descending order (recent sales first)
  const sortedDates = Object.keys(salesByDate).sort(
    (a, b) => {
      const [dayA, monthA, yearA] = a.split("-").map(Number);
      const [dayB, monthB, yearB] = b.split("-").map(Number);
      return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
    }
  );

  const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);

  // Filter advance profiles for datalist
  const advanceProfiles = customers
    .flatMap((c) =>
      c.profiles
        .filter((p) => p.advance?.value && !p.deleteuser?.value)
        .map((p) => ({ ...p, phoneNumber: c.phoneNumber }))
    );

  return (
    <div className="main-content">
      {isLoading && <div className="loading-message">Loading...</div>}
      {warning && <p className="warning-p">{warning}</p>}
      <div className="sales-form-container-p">
        <div className="form-group-p shop-selector-p">
          <label>Shop</label>
          <select value={shop} onChange={(e) => {
            setShop(e.target.value);
            setNewSale({
              billNo: "", // Backend will generate
              date: formatDateToDDMMYYYY(new Date().toISOString().split("T")[0]),
              profileName: "",
              phoneNumber: "",
              paymentType: "Cash",
              items: [],
            });
            setCurrentItem({ product: "", qty: "", unit: "", pricePerQty: "", category: "" });
            setAdvanceSearchTerm("");
            setSearchTerm("");
            setFilterDate("");
            setIsCustomUnit(false);
            setIsBillNoEditable(false);
            setIsDateEditable(false);
            setIsItemSearchManual(false);
            setWarning("");
          }}>
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <h2>New Sale Entry - {shop}</h2>
        <div className="sales-form-p">
          <div className="form-group-p">
            <label>
              Bill No
              <input
                type="checkbox"
                checked={isBillNoEditable}
                onChange={toggleBillNoEditable}
                style={{ marginLeft: "8px", marginRight: "4px" }}
              />
              Manual Bill No
            </label>
            <input
              type="text"
              name="billNo"
              value={newSale.billNo}
              onChange={handleInputChange}
              readOnly={!isBillNoEditable}
            />
          </div>
          <div className="form-group-p">
            <label>
              Date
              <input
                type="checkbox"
                checked={isDateEditable}
                onChange={toggleDateEditable}
                style={{ marginLeft: "8px", marginRight: "4px" }}
              />
              Manual Date
            </label>
            <input
              type="date"
              name="date"
              value={newSale.date.split("-").reverse().join("-")}
              onChange={(e) => handleInputChange({ target: { name: "date", value: e.target.value } })}
              readOnly={!isDateEditable}
            />
          </div>
          <div className="form-group-p">
            <label>Profile Name</label>
            {newSale.paymentType === "Advance" ? (
              <>
                <input
                  type="text"
                  value={advanceSearchTerm}
                  onChange={handleAdvanceProfileSelect}
                  placeholder="Search advance profiles"
                  list="advance-profiles"
                />
                <datalist id="advance-profiles">
                  {advanceProfiles
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(advanceSearchTerm.toLowerCase()) ||
                        p.phoneNumber.includes(advanceSearchTerm)
                    )
                    .map((p) => (
                      <option key={p.profileId} value={`${p.name} (${p.phoneNumber})`} />
                    ))}
                </datalist>
              </>
            ) : (
              <input
                type="text"
                name="profileName"
                value={newSale.profileName}
                onChange={handleInputChange}
                placeholder="Enter profile name"
              />
            )}
          </div>
          <div className="form-group-p">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={newSale.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              readOnly={newSale.paymentType === "Advance"}
            />
          </div>
          <div className="form-group-p">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={newSale.paymentType}
              onChange={handlePaymentTypeChange}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit">Credit</option>
              <option value="Advance">Advance</option>
            </select>
          </div>
          <div className="form-group-p item-row-p">
            <div style={{ flex: "2", marginRight: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={isItemSearchManual}
                  onChange={() => setIsItemSearchManual(!isItemSearchManual)}
                  style={{ marginRight: "8px" }}
                />
                Manual Search
              </label>
              {isItemSearchManual ? (
                <>
                  <input
                    type="text"
                    name="product"
                    value={currentItem.product}
                    onChange={handleItemChange}
                    placeholder="Search items"
                    list="stock-items"
                  />
                  <datalist id="stock-items">
                    {getGroupedStock().map((item) => (
                      <option key={`${item.name}|${item.category}|${item.unit}`} value={item.name}>
                        {item.name} (Qty: ${item.quantity} ${item.unit})
                      </option>
                    ))}
                  </datalist>
                </>
              ) : (
                <select
                  name="product"
                  value={currentItem.product}
                  onChange={handleItemChange}
                >
                  <option value="">Select item</option>
                  {getGroupedStock().map((item) => (
                    <option key={`${item.name}|${item.category}|${item.unit}`} value={item.name}>
                      {item.name} (Qty: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <input
              type="number"
              name="qty"
              placeholder="Qty"
              value={currentItem.qty}
              onChange={handleItemChange}
              min="1"
              className="small-input-p"
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isCustomUnit}
                  onChange={() => setIsCustomUnit(!isCustomUnit)}
                  style={{ marginRight: "8px" }}
                />
                Manual
              </label>
              {isCustomUnit ? (
                <input
                  type="text"
                  name="unit"
                  placeholder="Enter unit"
                  value={currentItem.unit}
                  onChange={handleItemChange}
                  className="small-input-p"
                  style={{ flex: "1", marginRight: "10px" }}
                />
              ) : (
                <select
                  style={{ flex: "1", marginRight: "10px" }}
                  name="unit"
                  value={currentItem.unit}
                  onChange={handleItemChange}
                  className="small-input-p"
                >
                  <option value="">unit</option>
                  <option value="KG">KG</option>
                  <option value="Bag">Bag</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Liter">Liter</option>
                </select>
              )}
            </div>
            <input
              type="number"
              name="pricePerQty"
              placeholder="Price"
              value={currentItem.pricePerQty}
              onChange={handleItemChange}
              className="small-input-p"
            />
            <input
              type="text"
              value={
                currentItem.product && currentItem.category && currentItem.unit
                  ? `Avg: ₹${getAveragePrice(currentItem.product, currentItem.category, currentItem.unit)}`
                  : "Avg: ₹0"
              }
              readOnly
              className="small-input-p"
              disabled
            />
            <button
              className="add-item-btn-p"
              onClick={addItemToSale}
              disabled={!currentItem.product || !currentItem.qty || !currentItem.unit || !currentItem.pricePerQty || isLoading}
              style={{ flex: "1" }}
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
          {newSale.items.length > 0 && (
            <table className="items-table-p">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Price/Unit</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {newSale.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>₹{item.pricePerQty}</td>
                    <td>₹{item.amount}</td>
                    <td>
                      <button className="delete-btn" onClick={() => removeItem(index)} disabled={isLoading}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row-p">
                  <td colSpan="4">Total Amount</td>
                  <td colSpan="2">₹{totalAmount}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div className="form-buttons-p">
            <button
              className="sale-entry-btn-p"
              onClick={handleSaleEntry}
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber || isLoading}
            >
              Sale Entry
            </button>
            <button
              className="generate-sale-btn-p"
              onClick={handleGenerateBillAndSale}
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber || isLoading}
            >
              Generate Bill & Sale Entry
            </button>
            <button
              className="generate-btn-p"
              onClick={handleGenerateBill}
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber || isLoading}
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      <div className="recent-sales-container-p">
        <h2>All Sales</h2>
        <div className="sales-filter-row-p">
          <label>Date:</label>
          <input
            type="date"
            value={filterDate ? filterDate.split("-").reverse().join("-") : ""}
            onChange={handleDateFilterChange}
          />
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder="Profile or phone"
          />
        </div>
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date}>
              <h3 style={{ color: "#ff6b35", margin: "20px 0 10px" }}>{date}</h3>
              <table
                className="sales-table-p"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#2b2b40",
                      color: "#a1a5b7",
                    }}
                  >
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Profile
                    </th>
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Bill No
                    </th>
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Items
                    </th>
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Total
                    </th>
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Payment
                    </th>
                    <th style={{ border: "1px solid #3a3a5a", padding: "10px", textAlign: "left" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesByDate[date]
                    .sort((a, b) => a.billNo.localeCompare(b.billNo))
                    .map((sale) => (
                      <tr key={sale.billNo}>
                        <td style={{ border: "1px solid #3a3a5a", padding: "10px" }}>
                          {sale.profileName}
                        </td>
                        <td style={{ border: "1px solid #3a3a5a", padding: "10px" }}>
                          {sale.billNo}
                        </td>
                        <td
                          style={{ border: "1px solid #3a3a5a", padding: "10px" }}
                          dangerouslySetInnerHTML={{
                            __html: sale.items
                              .map(
                                (item) =>
                                  `${item.product}: ${item.qty} ${item.unit}`
                              )
                              .join("<br />"),
                          }}
                        />
                        <td style={{ border: "1px solid #3a3a5a", padding: "10px" }}>
                          ₹{sale.totalAmount}
                        </td>
                        <td style={{ border: "1px solid #3a3a5a", padding: "10px" }}>
                          {sale.paymentType}
                        </td>
                        <td style={{ border: "1px solid #3a3a5a", padding: "10px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="print-btn"
                              onClick={() =>
                                handlePrintBill(
                                  {
                                    billNo: sale.billNo,
                                    date: sale.date,
                                    items: sale.items,
                                    totalAmount: sale.totalAmount,
                                    advanceRemaining: sale.advanceRemaining,
                                    creditAmount: sale.creditAmount,
                                  },
                                  sale.paymentType,
                                  sale.profileName,
                                  sale.phoneNumber
                                )
                              }
                              disabled={isLoading}
                            >
                              Print Bill
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteSale(
                                  sale.billNo,
                                  sale.profileId,
                                  sale.phoneNumber,
                                  sale.items
                                )
                              }
                              disabled={isLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No sales found.</p>
        )}
      </div>
    </div>
  );
};

export default SalesEntry;