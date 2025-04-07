import React, { useState } from "react";
import { Pencil, Save } from "lucide-react";
import customersData from "../customers.js"; 
import "./AdvancePayments.css";

const AdvancePayments = () => {
  const [customers, setCustomers] = useState(customersData); 
  const [newPayment, setNewPayment] = useState({
    customerName: "",
    phoneNumber: "",
    advanceAmount: "",
    paymentMethod: "Cash",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBills, setSelectedBills] = useState(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editedCustomer, setEditedCustomer] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const customer = customers.find((c) => c.phoneNumber === value);
      if (customer) {
        setNewPayment({ ...newPayment, phoneNumber: value, customerName: customer.name });
        setIsExistingCustomer(true);
      } else {
        setNewPayment({ ...newPayment, phoneNumber: value });
      }
    } else if (name === "customerName") {
      const customer = customers.find((c) => c.name.toLowerCase() === value.toLowerCase());
      if (customer) {
        setNewPayment({ ...newPayment, customerName: customer.name, phoneNumber: customer.phoneNumber });
        setIsExistingCustomer(true);
      } else {
        setNewPayment({ ...newPayment, customerName: value });
      }
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    setIsExistingCustomer(e.target.checked);
    setNewPayment({ ...newPayment, customerName: "", phoneNumber: "" });
  };

  const handleAddPayment = () => {
    if (!newPayment.customerName || !newPayment.phoneNumber || !newPayment.advanceAmount || !newPayment.paymentMethod) {
      alert("Please fill all fields");
      return;
    }

    const advanceAmount = parseFloat(newPayment.advanceAmount);
    if (advanceAmount <= 0) {
      alert("Advance amount must be a positive number");
      return;
    }

    const existingCustomer = customers.find((c) => c.name.toLowerCase() === newPayment.customerName.toLowerCase());
    if (existingCustomer) {
      setCustomers(
        customers.map((c) =>
          c.name.toLowerCase() === newPayment.customerName.toLowerCase()
            ? { ...c, advanceGiven: c.advanceGiven + advanceAmount, balance: c.balance + advanceAmount, paymentMethod: newPayment.paymentMethod }
            : c
        )
      );
    } else {
      setCustomers([
        ...customers,
        {
          id: customers.length + 1,
          name: newPayment.customerName,
          phoneNumber: newPayment.phoneNumber,
          advanceGiven: advanceAmount,
          advanceUsed: 0,
          balance: advanceAmount,
          paymentMethod: newPayment.paymentMethod,
          advance: true, // New customers added here will have advance: true
          bills: [],
        },
      ]);
    }

    setNewPayment({ customerName: "", phoneNumber: "", advanceAmount: "", paymentMethod: "Cash" });
    setIsExistingCustomer(false);
  };

  const handleEditStart = (customer) => {
    if (editingCustomerId === customer.id) {
      setEditingCustomerId(null);
      setEditedCustomer(null);
    } else {
      setEditingCustomerId(customer.id);
      setEditedCustomer({ ...customer });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer({ ...editedCustomer, [name]: value });
  };

  const handleSaveEdit = () => {
    setCustomers(customers.map((c) => (c.id === editedCustomer.id ? { ...editedCustomer } : c)));
    setEditingCustomerId(null);
    setEditedCustomer(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter customers with advance: true and apply search term
  const filteredCustomers = customers
    .filter((customer) => customer.advance) // Only show customers with advance: true
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phoneNumber.includes(searchTerm)
    );

  const handleShowBills = (bills, customerPaymentMethod, customerName, customerPhoneNumber) => {
    setSelectedBills({ bills, customerPaymentMethod, customerName, customerPhoneNumber });
  };

  const handleCloseModal = () => {
    setSelectedBills(null);
  };

  const handlePrintBill = (bill, customerPaymentMethod, customerName, customerPhoneNumber) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
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
              <tr class="total">
                <td colspan="3">Advance Remaining</td>
                <td>₹${bill.advanceRemaining}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const isEdited = (customer) => {
    if (!editedCustomer) return false;
    return (
      customer.name !== editedCustomer.name ||
      customer.phoneNumber !== editedCustomer.phoneNumber ||
      customer.paymentMethod !== editedCustomer.paymentMethod
    );
  };

  return (
    <div className="main-content">
      <div className="advance-payment-form-container">
        <h2>Add New Advance Payment</h2>
        <div className="advance-payment-form">
          <div className="form-group">
            <div className="checkbox-label">
              <label>Customer Name</label>
              <label className="checkbox-container">
                <input type="checkbox" checked={isExistingCustomer} onChange={handleCheckboxChange} />
                Existing Customer
              </label>
            </div>
            {isExistingCustomer ? (
              <select name="customerName" value={newPayment.customerName} onChange={handleInputChange}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.name}>
                    {customer.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="customerName"
                placeholder="Enter customer name"
                value={newPayment.customerName}
                onChange={handleInputChange}
              />
            )}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={newPayment.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Advance Amount</label>
            <input
              type="number"
              name="advanceAmount"
              placeholder="Enter amount"
              value={newPayment.advanceAmount}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" value={newPayment.paymentMethod} onChange={handleInputChange}>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-buttons">
            <button className="add-btn" onClick={handleAddPayment}>
              Add Advance Payment
            </button>
          </div>
        </div>
      </div>

      <div className="advance-payment-list-container">
        <h2>Advance Payment Balances</h2>
        <div className="advance-payment-filter">
          <input type="text" placeholder="Search customer" value={searchTerm} onChange={handleSearch} />
        </div>
        <table className="advance-payment-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone Number</th>
              <th>Advance Given</th>
              <th>Advance Used</th>
              <th>Balance</th>
              <th>Payment Method</th>
              <th>Bill</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedCustomer.name}
                      onChange={handleEditChange}
                      className="inline-edit-input"
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td>
                  {editingCustomerId === customer.id ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editedCustomer.phoneNumber}
                      onChange={handleEditChange}
                      className="inline-edit-input"
                    />
                  ) : (
                    customer.phoneNumber
                  )}
                </td>
                <td>₹{customer.advanceGiven}</td>
                <td>₹{customer.advanceUsed}</td>
                <td>₹{customer.balance}</td>
                <td>
                  {editingCustomerId === customer.id ? (
                    <select
                      name="paymentMethod"
                      value={editedCustomer.paymentMethod}
                      onChange={handleEditChange}
                      className="inline-edit-select"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  ) : (
                    customer.paymentMethod
                  )}
                </td>
                <td>
                  <button
                    className="show-bills-btn"
                    onClick={() => handleShowBills(customer.bills, customer.paymentMethod, customer.name, customer.phoneNumber)}
                    disabled={customer.bills.length === 0}
                  >
                    Show Bills
                  </button>
                </td>
                <td>
                  {editingCustomerId === customer.id && isEdited(customer) ? (
                    <button className="save-btn" onClick={handleSaveEdit}>
                      <Save size={16} />
                    </button>
                  ) : (
                    <button className="edit-btn" onClick={() => handleEditStart(customer)}>
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBills && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseModal}>
              Close
            </button>
            <h2>Bill Details</h2>
            {selectedBills.bills.length === 0 ? (
              <p>No bills available for this customer.</p>
            ) : (
              selectedBills.bills.map((bill) => (
                <div key={bill.billNo} className="bill-details">
                  <h3>Bill No: {bill.billNo}</h3>
                  <p>Customer Name: {selectedBills.customerName}</p>
                  <p>Phone Number: {selectedBills.customerPhoneNumber}</p>
                  <p>Date: {bill.date}</p>
                  <p>Payment Method: {selectedBills.customerPaymentMethod}</p>
                  <table className="bill-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price/Qty</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.pricePerQty}</td>
                          <td>₹{item.amount}</td>
                        </tr>
                      ))}
                      <tr className="total">
                        <td colSpan="3">Total Amount</td>
                        <td>₹${bill.totalAmount}</td>
                      </tr>
                      <tr className="total">
                        <td colSpan="3">Advance Remaining</td>
                        <td>₹${bill.advanceRemaining}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    className="print-btn"
                    onClick={() =>
                      handlePrintBill(bill, selectedBills.customerPaymentMethod, selectedBills.customerName, selectedBills.customerPhoneNumber)
                    }
                  >
                    Print Bill
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePayments;