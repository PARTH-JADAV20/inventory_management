import React, { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import customersData from "../customers";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState(customersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedCustomer, setEditedCustomer] = useState(null);
  const [selectedBills, setSelectedBills] = useState(null);

  // Calculate total purchased (sum of bill totalAmounts)
  const calculateTotalPurchased = (bills) => {
    return bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  };

  // Sort customers by last updated (using the latest bill date or creation date)
  useEffect(() => {
    const updatedCustomers = customers.map((customer) => ({
      ...customer,
      lastUpdated:
        customer.bills.length > 0
          ? new Date(customer.bills[customer.bills.length - 1].date)
          : new Date(customer.id * 1000), // Proxy for creation date if no bills
    })).sort((a, b) => b.lastUpdated - a.lastUpdated);
    setCustomers(updatedCustomers);
  }, []);

  // Filter customers based on search term (name or phone number)
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
  );

  // Summary statistics
  const totalCustomers = customers.length;
  const advanceCustomers = customers.filter((c) => c.advance).length;

  // Handle edit
  const handleEdit = (customer) => {
    setEditedCustomer({ ...customer });
  };

  const handleSaveEdit = () => {
    setCustomers(
      customers.map((c) =>
        c.id === editedCustomer.id ? { ...editedCustomer, lastUpdated: new Date() } : c
      )
    );
    setEditedCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer({ ...editedCustomer, [name]: value });
  };

  // Handle show bills
  const handleShowBills = (bills, customerPaymentMethod, customerName, customerPhoneNumber) => {
    setSelectedBills({ bills, customerPaymentMethod, customerName, customerPhoneNumber });
  };

  const handleCloseModal = () => {
    setSelectedBills(null);
  };

  // Handle print bill
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
    const customer = customers.find((c) => c.name === customerName && c.phoneNumber === customerPhoneNumber);
    if (customer && customer.advance && bill.advanceRemaining !== null) {
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

  return (
    <div className="main-content">
      <div className="customers-header-p2">
        <h2>Customer Management</h2>
        <div className="summary-stats-p2">
          <p>Total Customers: {totalCustomers}</p>
          <p>Advance Payment Customers: {advanceCustomers}</p>
        </div>
        <div className="search-container-p2">
          <input
            type="text"
            placeholder="Search by name or phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-p2"
          />
        </div>
      </div>

      <div className="customers-table-container-p2">
        <table className="customers-table-p2">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Total Purchased (₹)</th>
              <th>Advance Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  {editedCustomer && editedCustomer.id === customer.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedCustomer.name}
                      onChange={handleInputChange}
                      className="inline-edit-input-p2"
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td>
                  {editedCustomer && editedCustomer.id === customer.id ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editedCustomer.phoneNumber}
                      onChange={handleInputChange}
                      className="inline-edit-input-p2"
                    />
                  ) : (
                    customer.phoneNumber
                  )}
                </td>
                <td>₹{calculateTotalPurchased(customer.bills)}</td>
                <td>{customer.advance ? "Yes" : "No"}</td>
                <td>
                  <button
                    className="show-bills-btn-p2"
                    onClick={() =>
                      handleShowBills(customer.bills, customer.paymentMethod, customer.name, customer.phoneNumber)
                    }
                    disabled={customer.bills.length === 0}
                  >
                    Show Bills
                  </button>
                  {editedCustomer && editedCustomer.id === customer.id ? (
                    <button className="save-btn-p2" onClick={handleSaveEdit}>
                      Save
                    </button>
                  ) : (
                    <button className="edit-btn-p2" onClick={() => handleEdit(customer)}>
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
                        <td>₹{bill.totalAmount}</td>
                      </tr>
                      {selectedBills.bills[0].advanceRemaining !== null && (
                        <tr className="total">
                          <td colSpan="3">Advance Remaining</td>
                          <td>₹{bill.advanceRemaining !== null ? bill.advanceRemaining : 0}</td>
                        </tr>
                      )}
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

export default Customers;