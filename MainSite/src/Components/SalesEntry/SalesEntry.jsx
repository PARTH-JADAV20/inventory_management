import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import customersData from "../customers";
import stockItems from "../stockItems";
import "./SalesEntry.css";

const SalesEntry = () => {
  const [customers, setCustomers] = useState(customersData);
  const [stock, setStock] = useState(stockItems);
  const [newSale, setNewSale] = useState({
    billNo: `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`, // e.g., B001, B025
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }), // e.g., 06 April 2025
    customerName: "",
    phoneNumber: "",
    paymentType: "Cash",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    product: "",
    qty: "",
    unit: "", // No pre-selection
    pricePerQty: "",
  });
  const [recentSales, setRecentSales] = useState([]);
  const [warning, setWarning] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale((prev) => ({ ...prev, [name]: value }));

    if (name === "phoneNumber") {
      const customer = customers.find((c) => c.phoneNumber === value);
      if (customer) {
        setNewSale((prev) => ({
          ...prev,
          customerName: customer.name,
          paymentType: customer.advance ? customer.paymentMethod : prev.paymentType, // Auto-select payment method for advance customers
        }));
      }
    } else if (name === "customerName") {
      const customer = customers.find((c) => c.name.toLowerCase() === value.toLowerCase());
      if (customer) {
        setNewSale((prev) => ({
          ...prev,
          phoneNumber: customer.phoneNumber,
          paymentType: customer.advance ? customer.paymentMethod : prev.paymentType, // Auto-select payment method for advance customers
        }));
      }
    }
  };

  // Handle item input changes
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => {
      const updatedItem = { ...prev, [name]: value };
      if (name === "product") {
        const stockItem = stock.find((item) => item.name === value);
        return {
          ...updatedItem,
          pricePerQty: stockItem ? stockItem.price : "",
          unit: "", // Reset unit when product changes
        };
      }
      return updatedItem;
    });
  };

  // Add item to sale
  const addItemToSale = () => {
    if (!currentItem.product || !currentItem.qty || !currentItem.unit || !currentItem.pricePerQty) {
      alert("Please fill all item fields, including unit");
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
    setNewSale((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  };

  // Generate bill and update stock/customer data, then print
  const handleGenerateBill = () => {
    const totalAmount = newSale.items.reduce((sum, item) => sum + item.amount, 0);
    if (!newSale.customerName || !newSale.phoneNumber) {
      setWarning("Please enter both customer name and phone number");
      return;
    }
    const customer = customers.find((c) => c.name.toLowerCase() === newSale.customerName.toLowerCase());

    if (customer && customer.advance) {
      const newBalance = customer.balance - totalAmount;
      if (newBalance < 0) {
        setWarning("Warning: Advance balance insufficient!");
        return;
      }
      setCustomers(
        customers.map((c) =>
          c.id === customer.id
            ? { ...c, advanceUsed: c.advanceUsed + totalAmount, balance: newBalance }
            : c
        )
      );
    } else if (!customer) {
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          name: newSale.customerName,
          phoneNumber: newSale.phoneNumber,
          advanceGiven: 0,
          advanceUsed: 0,
          balance: 0,
          paymentMethod: newSale.paymentType,
          advance: false, // Default to false for new customers
          bills: [],
        },
      ]);
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

    // Add to recent sales and bills
    const newBill = {
      billNo: newSale.billNo,
      date: newSale.date,
      items: newSale.items,
      totalAmount,
      advanceRemaining: customer && customer.advance ? customer.balance - totalAmount : null,
    };
    if (customer && customer.advance) {
      setCustomers(
        customers.map((c) =>
          c.id === customer.id ? { ...c, bills: [...c.bills, newBill] } : c
        )
      );
    }

    setRecentSales((prev) => [
      { ...newSale, totalAmount, customerPhoneNumber: newSale.phoneNumber, bills: [newBill] },
      ...prev.slice(0, 4),
    ]);
    setNewSale({
      billNo: `B${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`, // Generate new bill no
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }), // Reset date
      customerName: "",
      phoneNumber: "",
      paymentType: "Cash",
      items: [],
    });
    setWarning("");

    // Trigger print after data update
    handlePrintBill(newBill, newSale.paymentType, newSale.customerName, newSale.phoneNumber);
  };

  // Print bill (copied from AdvancePayments.js with advance conditional)
  const handlePrintBill = (bill, customerPaymentMethod, customerName, customerPhoneNumber) => {
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
          <p>Customer Name: ${customerName}</p>
          <p>Phone Number: ${customerPhoneNumber}</p>
          <p>Date: ${bill.date}</p>
          <p class="payment-method">Payment Method: ${customerPaymentMethod}</p>
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

    // Conditionally add advance remaining only if customer has advance: true
    if (bill.advanceRemaining !== null) {
      billContent += `
              <tr class="total">
                <td colspan="3">Advance Remaining</td>
                <td>₹${bill.advanceRemaining !== null ? bill.advanceRemaining : 0}</td>
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

  return (
    <div className="main-content">
      <div className="sales-form-container-p">
        <h2>New Sale Entry</h2>
        <div className="sales-form-p">
          <div className="form-group-p">
            <label>Bill No</label>
            <input
              type="text"
              name="billNo"
              value={newSale.billNo}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className="form-group-p">
            <label>Date</label>
            <input
              type="text"
              name="date"
              value={newSale.date}
              onChange={handleInputChange}
              readOnly
            />
          </div>
          <div className="form-group-p">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={newSale.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
            />
          </div>
          <div className="form-group-p">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={newSale.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group-p">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={newSale.paymentType}
              onChange={handleInputChange}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-group-p item-row-p">
            <select
              name="product"
              value={currentItem.product}
              onChange={handleItemChange}
              style={{ flex: "2", marginRight: "10px" }}
            >
              <option value="">Select item</option>
              {stock.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name} (Qty: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              name="qty"
              placeholder="Qty"
              value={currentItem.qty}
              onChange={handleItemChange}
              min="1"
              style={{ flex: "1", marginRight: "10px" }}
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
            </select>
            <input
              type="number"
              name="pricePerQty"
              placeholder="Price/Unit"
              value={currentItem.pricePerQty}
              onChange={handleItemChange}
              readOnly
              style={{ flex: "1", marginRight: "10px" }}
            />
            <button
              className="add-item-btn-p"
              onClick={addItemToSale}
              disabled={!currentItem.product || !currentItem.qty || !currentItem.unit}
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
                      <button
                        className="delete-btn"
                        onClick={() => removeItem(index)}
                      >
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
              className="generate-btn-p"
              onClick={handleGenerateBill}
              disabled={newSale.items.length === 0 || !newSale.customerName || !newSale.phoneNumber}
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
                <th>Customer</th>
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
                    <td>{sale.customerName}</td>
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