import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import customersData from "../customers";
import stockItems from "../stockItems";
import "./SalesEntry.css";

const SalesEntry = () => {
  const [customers, setCustomers] = useState(customersData);
  const [stock, setStock] = useState(stockItems);
  const [newSale, setNewSale] = useState({
    billNo: `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
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
  });
  const [recentSales, setRecentSales] = useState([]);
  const [warning, setWarning] = useState("");
  const [isBillNoEditable, setIsBillNoEditable] = useState(false);
  const [isDateEditable, setIsDateEditable] = useState(false);
  const [isItemSearchManual, setIsItemSearchManual] = useState(false);
  const [advanceSearchTerm, setAdvanceSearchTerm] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale((prev) => ({ ...prev, [name]: value }));
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
    setCurrentItem((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "product" ? { unit: "", pricePerQty: "" } : {}),
    }));
  };

  // Toggle bill no editability and reset if unchecked
  const toggleBillNoEditable = () => {
    setIsBillNoEditable((prev) => {
      if (prev) {
        setNewSale((prevSale) => ({
          ...prevSale,
          billNo: `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
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
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
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

    const stockItem = stock.find((item) => item.name === currentItem.product);
    if (!stockItem || stockItem.quantity < qty || stockItem.unit !== currentItem.unit) {
      alert("Insufficient stock, invalid product, or unit mismatch");
      return;
    }

    setNewSale((prev) => ({
      ...prev,
      items: [...prev.items, { ...currentItem, qty, pricePerQty, amount }],
    }));
    setCurrentItem({ product: "", qty: "", unit: "", pricePerQty: "" });
  };

  // Remove item from sale
  const removeItem = (index) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Calculate average price for a product
  const getAveragePrice = (product) => {
    const stockItem = stock.find((item) => item.name === product);
    return stockItem ? stockItem.price : 0;
  };

  // Save sale (shared logic for all buttons)
  const saveSale = () => {
    const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);
    if (!newSale.profileName || !newSale.phoneNumber) {
      setWarning("Please enter both profile name and phone number");
      return false;
    }

    let customer = customers.find((c) => c.phoneNumber === newSale.phoneNumber);
    let profile = customer?.profiles.find((p) => p.name === newSale.profileName);

    if (newSale.paymentType === "Advance" && !profile?.advance) {
      setWarning("Selected profile does not have advance enabled");
      return false;
    }

    const newBill = {
      billNo: newSale.billNo,
      date: newSale.date,
      items: newSale.items,
      totalAmount,
      advanceRemaining: null,
    };

    if (newSale.paymentType === "Advance" && profile) {
      const newBalance = profile.balance - totalAmount;
      if (newBalance < 0) {
        const addToCredit = window.confirm(
          `Insufficient advance balance (₹${profile.balance}). Add ₹${-newBalance} to credit?`
        );
        if (!addToCredit) {
          setWarning("Advance balance insufficient");
          return false;
        }
        setCustomers(
          customers.map((c) =>
            c.phoneNumber === newSale.phoneNumber
              ? {
                  ...c,
                  profiles: c.profiles.map((p) =>
                    p.profileId === profile.profileId
                      ? {
                          ...p,
                          advanceUsed: p.advanceUsed + profile.balance,
                          balance: 0,
                          credit: (p.credit || 0) - newBalance,
                          bills: [...p.bills, { ...newBill, advanceRemaining: 0 }],
                        }
                      : p
                  ),
                }
              : c
          )
        );
      } else {
        setCustomers(
          customers.map((c) =>
            c.phoneNumber === newSale.phoneNumber
              ? {
                  ...c,
                  profiles: c.profiles.map((p) =>
                    p.profileId === profile.profileId
                      ? {
                          ...p,
                          advanceUsed: p.advanceUsed + totalAmount,
                          balance: newBalance,
                          bills: [...p.bills, { ...newBill, advanceRemaining: newBalance }],
                        }
                      : p
                  ),
                }
              : c
          )
        );
      }
    } else if (!customer) {
      const newCustomer = {
        phoneNumber: newSale.phoneNumber,
        profiles: [
          {
            profileId: `profile-${Date.now()}`,
            name: newSale.profileName,
            advanceGiven: 0,
            advanceUsed: 0,
            balance: 0,
            credit: 0,
            paymentMethod: newSale.paymentType,
            advance: false,
            bills: newSale.paymentType === "Credit" ? [{ ...newBill, creditAmount: totalAmount }] : [newBill],
          },
        ],
      };
      setCustomers([...customers, newCustomer]);
    } else if (!profile) {
      const newProfile = {
        profileId: `profile-${Date.now()}`,
        name: newSale.profileName,
        advanceGiven: 0,
        advanceUsed: 0,
        balance: 0,
        credit: 0,
        paymentMethod: newSale.paymentType,
        advance: false,
        bills: newSale.paymentType === "Credit" ? [{ ...newBill, creditAmount: totalAmount }] : [newBill],
      };
      setCustomers(
        customers.map((c) =>
          c.phoneNumber === newSale.phoneNumber
            ? { ...c, profiles: [...c.profiles, newProfile] }
            : c
        )
      );
    } else if (newSale.paymentType === "Credit") {
      setCustomers(
        customers.map((c) =>
          c.phoneNumber === newSale.phoneNumber
            ? {
                ...c,
                profiles: c.profiles.map((p) =>
                  p.profileId === profile.profileId
                    ? {
                        ...p,
                        credit: (p.credit || 0) + totalAmount,
                        bills: [...p.bills, { ...newBill, creditAmount: totalAmount }],
                      }
                    : p
                ),
              }
            : c
        )
      );
    } else {
      setCustomers(
        customers.map((c) =>
          c.phoneNumber === newSale.phoneNumber
            ? {
                ...c,
                profiles: c.profiles.map((p) =>
                  p.profileId === profile.profileId
                    ? { ...p, bills: [...p.bills, newBill] }
                    : p
                ),
              }
            : c
        )
      );
    }

    // Update stock
    newSale.items.forEach((item) => {
      const stockItem = stock.find((s) => s.name === item.product);
      if (stockItem) {
        setStock(
          stock.map((s) =>
            s.id === stockItem.id ? { ...s, quantity: s.quantity - item.qty } : s
          )
        );
      }
    });

    // Update recent sales
    setRecentSales((prev) => [
      { ...newSale, totalAmount, bills: [newBill] },
      ...prev.slice(0, 4),
    ]);

    // Reset form
    setNewSale({
      billNo: `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      profileName: "",
      phoneNumber: "",
      paymentType: "Cash",
      items: [],
    });
    setAdvanceSearchTerm("");
    setWarning("");
    return true;
  };

  // Handle Sale Entry
  const handleSaleEntry = () => {
    saveSale();
  };

  // Handle Generate Bill and Sale Entry
  const handleGenerateBillAndSale = () => {
    if (saveSale()) {
      const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);
      const bill = {
        billNo: newSale.billNo,
        date: newSale.date,
        items: newSale.items,
        totalAmount,
        advanceRemaining: null,
      };
      const customer = customers.find((c) => c.phoneNumber === newSale.phoneNumber);
      const profile = customer?.profiles.find((p) => p.name === newSale.profileName);
      if (profile?.advance) {
        bill.advanceRemaining = profile.balance - totalAmount;
      }
      handlePrintBill(bill, newSale.paymentType, newSale.profileName, newSale.phoneNumber);
    }
  };

  // Handle Generate Bill
  const handleGenerateBill = () => {
    if (saveSale()) {
      const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);
      const bill = {
        billNo: newSale.billNo,
        date: newSale.date,
        items: newSale.items,
        totalAmount,
        advanceRemaining: null,
      };
      const customer = customers.find((c) => c.phoneNumber === newSale.phoneNumber);
      const profile = customer?.profiles.find((p) => p.name === newSale.profileName);
      if (profile?.advance) {
        bill.advanceRemaining = profile.balance - totalAmount;
      }
      handlePrintBill(bill, newSale.paymentType, newSale.profileName, newSale.phoneNumber);
    }
  };

  // Print bill
  const handlePrintBill = (bill, paymentMethod, profileName, phoneNumber) => {
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
          <p class="payment-method">Payment Method: ${paymentMethod}</p>
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

  const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);

  // Filter advance profiles for datalist
  const advanceProfiles = customers
    .flatMap((c) => c.profiles.map((p) => ({ ...p, phoneNumber: c.phoneNumber })))
    .filter((p) => p.advance);

  return (
    <div className="main-content">
      <div className="sales-form-container-p">
        <h2>New Sale Entry</h2>
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
              />Manual Date
            </label>
            <input
              type="text"
              name="date"
              value={newSale.date}
              onChange={handleInputChange}
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
                    {stock.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name} (Qty: {item.quantity} {item.unit})
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
                  {stock.map((item) => (
                    <option key={item.id} value={item.name}>
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
            <select
              name="unit"
              value={currentItem.unit}
              onChange={handleItemChange}
              style={{ flex: "1", marginRight: "10px" }}
            >
              <option value="">Select unit</option>
              <option value="KG">KG</option>
              <option value="Bag">Bag</option>
              <option value="Pieces">Pieces</option>
              <option value="Liter">Liter</option>
            </select>
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
              value={`Avg: ₹${getAveragePrice(currentItem.product)}`}
              readOnly
              className="small-input-p"
            />
            <button
              className="add-item-btn-p"
              onClick={addItemToSale}
              disabled={!currentItem.product || !currentItem.qty || !currentItem.unit || !currentItem.pricePerQty}
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
                      <button className="delete-btn" onClick={() => removeItem(index)}>
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
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber}
            >
              Sale Entry
            </button>
            <button
              className="generate-sale-btn-p"
              onClick={handleGenerateBillAndSale}
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber}
            >
              Generate Bill & Sale Entry
            </button>
            <button
              className="generate-btn-p"
              onClick={handleGenerateBill}
              disabled={newSale.items.length === 0 || !newSale.profileName || !newSale.phoneNumber}
            >
              Generate Bill
            </button>
          </div>
          {warning && <p className="warning-p">{warning}</p>}
        </div>
      </div>

      <div className="recent-sales-container-p">
        <h2>Recent Sales</h2>
        {recentSales.length > 0 ? (
          <table className="sales-table-p">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Price/Unit</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, index) =>
                sale.items.map((item, i) => (
                  <tr key={`${index}-${i}`}>
                    <td>{sale.profileName}</td>
                    <td>{item.product}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                    <td>₹{item.pricePerQty}</td>
                    <td>₹{item.amount}</td>
                    <td>{sale.paymentType}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p>No recent sales.</p>
        )}
      </div>
    </div>
  );
};

export default SalesEntry;