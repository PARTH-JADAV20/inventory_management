import React, { useState } from "react";
import { Pencil, Save, ChevronDown, ChevronUp } from "lucide-react";
import customersData from "../customers.js";
import "./AdvancePayments.css";

const AdvancePayments = () => {
  const [customers, setCustomers] = useState(customersData);
  const [newPayment, setNewPayment] = useState({
    customerName: "",
    phoneNumber: "",
    profileId: "",
    advanceAmount: "",
    paymentMethod: "Cash",
    newProfileName: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBills, setSelectedBills] = useState(null);
  const [expandedContractors, setExpandedContractors] = useState({});
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);

  // Derive common name from profiles
  const getCommonName = (profiles) => {
    const names = profiles.map((p) => p.name.replace(/ \[.*\]$/, ""));
    return names[0] || "Unknown";
  };

  // Toggle contractor profile visibility
  const toggleContractor = (phoneNumber) => {
    setExpandedContractors((prev) => ({
      ...prev,
      [phoneNumber]: !prev[phoneNumber],
    }));
  };

  // Handle input changes for the advance payment form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "customerName") {
      if (isExistingCustomer) {
        // Check if value matches datalist format: "Common Name (PhoneNumber)"
        const match = value.match(/^(.+)\s*\((\d+)\)$/);
        if (match) {
          const [, commonName, phoneNumber] = match;
          setNewPayment({
            ...newPayment,
            customerName: commonName,
            phoneNumber,
            profileId: "",
            newProfileName: "",
          });
        } else {
          setNewPayment({
            ...newPayment,
            customerName: value,
            phoneNumber: "",
            profileId: "",
            newProfileName: "",
          });
        }
      } else {
        setNewPayment({
          ...newPayment,
          customerName: value,
          phoneNumber: "",
          profileId: "",
          newProfileName: "",
        });
      }
    } else if (name === "phoneNumber") {
      if (isExistingCustomer) {
        const customer = customers.find((c) => c.phoneNumber === value);
        if (customer) {
          setNewPayment({
            ...newPayment,
            customerName: getCommonName(customer.profiles),
            phoneNumber: value,
            profileId: "",
            newProfileName: "",
          });
        } else {
          setNewPayment({
            ...newPayment,
            phoneNumber: value,
            customerName: "",
            profileId: "",
            newProfileName: "",
          });
        }
      } else {
        setNewPayment({
          ...newPayment,
          phoneNumber: value,
          profileId: "",
          newProfileName: "",
        });
      }
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  // Handle checkbox for existing customer
  const handleCheckboxChange = (e) => {
    setIsExistingCustomer(e.target.checked);
    setNewPayment({
      customerName: "",
      phoneNumber: "",
      profileId: "",
      advanceAmount: "",
      paymentMethod: "Cash",
      newProfileName: "",
    });
  };

  // Handle adding a new advance payment
  const handleAddPayment = () => {
    if (
      !newPayment.customerName ||
      !newPayment.phoneNumber ||
      !newPayment.profileId ||
      !newPayment.advanceAmount ||
      !newPayment.paymentMethod
    ) {
      alert("Please fill all fields");
      return;
    }

    if (newPayment.profileId.startsWith("new-profile") && !newPayment.newProfileName) {
      alert("Please enter a profile name");
      return;
    }

    const advanceAmount = parseFloat(newPayment.advanceAmount);
    if (advanceAmount <= 0) {
      alert("Advance amount must be a positive number");
      return;
    }

    const existingCustomer = customers.find((c) => c.phoneNumber === newPayment.phoneNumber);
    if (!isExistingCustomer && existingCustomer) {
      alert("Phone number already exists. Please select Existing Customer.");
      return;
    }

    if (existingCustomer && newPayment.profileId.startsWith("new-profile")) {
      // Check for duplicate profile name
      const profileExists = existingCustomer.profiles.some(
        (p) => p.name.toLowerCase() === newPayment.newProfileName.toLowerCase()
      );
      if (profileExists) {
        alert("Profile name already exists for this customer");
        return;
      }
    }

    if (existingCustomer) {
      // Update existing customer's profile or add new profile
      setCustomers(
        customers.map((c) =>
          c.phoneNumber === newPayment.phoneNumber
            ? {
                ...c,
                profiles:
                  newPayment.profileId.startsWith("new-profile")
                    ? [
                        ...c.profiles,
                        {
                          profileId: `profile-${Date.now()}`,
                          name: newPayment.newProfileName,
                          advanceGiven: advanceAmount,
                          advanceUsed: 0,
                          balance: advanceAmount,
                          paymentMethod: newPayment.paymentMethod,
                          advance: true,
                          bills: [],
                        },
                      ]
                    : c.profiles.map((p) =>
                        p.profileId === newPayment.profileId
                          ? {
                              ...p,
                              advanceGiven: p.advanceGiven + advanceAmount,
                              balance: p.balance + advanceAmount,
                              paymentMethod: newPayment.paymentMethod,
                            }
                          : p
                      ),
              }
            : c
        )
      );
    } else {
      // Add new customer with a single profile
      const profileId = `profile-${Date.now()}`;
      setCustomers([
        ...customers,
        {
          phoneNumber: newPayment.phoneNumber,
          profiles: [
            {
              profileId: profileId,
              name: newPayment.customerName,
              advanceGiven: advanceAmount,
              advanceUsed: 0,
              balance: advanceAmount,
              paymentMethod: newPayment.paymentMethod,
              advance: true,
              bills: [],
            },
          ],
        },
      ]);
      setNewPayment({ ...newPayment, profileId });
    }

    setNewPayment({
      customerName: "",
      phoneNumber: "",
      profileId: "",
      advanceAmount: "",
      paymentMethod: "Cash",
      newProfileName: "",
    });
    setIsExistingCustomer(false);
  };

  // Start editing a profile
  const handleEditStart = (profile, phoneNumber) => {
    if (editingProfile?.profileId === profile.profileId) {
      setEditingProfile(null);
      setEditedProfile(null);
    } else {
      setEditingProfile({ profileId: profile.profileId, phoneNumber });
      setEditedProfile({ ...profile });
    }
  };

  // Handle changes to edited profile
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  // Save edited profile
  const handleSaveEdit = () => {
    setCustomers(
      customers.map((c) =>
        c.phoneNumber === editingProfile.phoneNumber
          ? {
              ...c,
              profiles: c.profiles.map((p) =>
                p.profileId === editedProfile.profileId ? { ...editedProfile } : p
              ),
            }
          : c
      )
    );
    setEditingProfile(null);
    setEditedProfile(null);
  };

  // Handle search input for table
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter customers based on search term (name or phone number)
  const filteredCustomers = customers.filter(
    (customer) =>
      (getCommonName(customer.profiles).toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm)) &&
      customer.profiles.some((p) => p.advance)
  );

  // Show bills for a profile
  const handleShowBills = (bills, paymentMethod, profileName, phoneNumber) => {
    setSelectedBills({ bills, paymentMethod, profileName, phoneNumber });
  };

  // Close bill modal
  const handleCloseModal = () => {
    setSelectedBills(null);
  };

  // Print a bill
  const handlePrintBill = (bill, paymentMethod, profileName, phoneNumber) => {
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
          <p>Profile Name: ${profileName}</p>
          <p>Phone Number: ${phoneNumber}</p>
          <p>Date: ${bill.date || "N/A"}</p>
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

  // Filter customers for datalist based on customerName input
  const filteredCustomerOptions = customers.filter(
    (customer) =>
      getCommonName(customer.profiles).toLowerCase().includes(newPayment.customerName.toLowerCase()) &&
      customer.profiles.some((p) => p.advance)
  );

  return (
    <div className="main-content">
      {/* Advance Payment Form */}
      <div className="advance-payment-form-container">
        <h2>Add New Advance Payment</h2>
        <div className="advance-payment-form">
          <div className="form-group">
            <label className="checkbox-label">
              <div>Customer</div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isExistingCustomer}
                  onChange={handleCheckboxChange}
                />
                Existing Customer
              </div>
            </label>
            <input
              type="text"
              name="customerName"
              placeholder={isExistingCustomer ? "Type customer name" : "Enter customer name"}
              value={newPayment.customerName}
              onChange={handleInputChange}
              list={isExistingCustomer ? "customerList" : undefined}
            />
            {isExistingCustomer && (
              <datalist id="customerList">
                {filteredCustomerOptions.map((customer) => (
                  <option
                    key={customer.phoneNumber}
                    value={`${getCommonName(customer.profiles)} (${customer.phoneNumber})`}
                  />
                ))}
              </datalist>
            )}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              placeholder={isExistingCustomer ? "Type phone number" : "Enter phone number"}
              value={newPayment.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Profile</label>
            <select
              name="profileId"
              value={newPayment.profileId}
              onChange={handleInputChange}
              disabled={!newPayment.phoneNumber}
            >
              <option value="">Select profile</option>
              <option value={`new-profile-${newPayment.phoneNumber}`}>
                New Profile
              </option>
              {newPayment.phoneNumber &&
                customers
                  .find((c) => c.phoneNumber === newPayment.phoneNumber)
                  ?.profiles.filter((p) => p.advance)
                  .map((p) => (
                    <option key={p.profileId} value={p.profileId}>
                      {p.name}
                    </option>
                  ))}
            </select>
          </div>
          {newPayment.profileId.startsWith("new-profile") && (
            <div className="form-group">
              <label>Profile Name</label>
              <input
                type="text"
                name="newProfileName"
                placeholder="Enter profile name"
                value={newPayment.newProfileName}
                onChange={handleInputChange}
              />
            </div>
          )}
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
            <select
              name="paymentMethod"
              value={newPayment.paymentMethod}
              onChange={handleInputChange}
            >
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

      {/* Advance Balances Table */}
      <div className="advance-payment-list-container">
        <h2>Advance Payment Balances</h2>
        <div className="advance-payment-filter">
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <table className="advance-payment-table">
          <thead>
            <tr>
              <th>Contractor</th>
              <th>Profile</th>
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
              <React.Fragment key={customer.phoneNumber}>
                <tr className="contractor-row">
                  <td colSpan={8}>
                    <button
                      className="contractor-toggle"
                      onClick={() => toggleContractor(customer.phoneNumber)}
                    >
                      {expandedContractors[customer.phoneNumber] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      {getCommonName(customer.profiles)} ({customer.profiles.filter((p) => p.advance).length} profiles)
                    </button>
                  </td>
                </tr>
                {expandedContractors[customer.phoneNumber] &&
                  customer.profiles
                    .filter((p) => p.advance)
                    .map((profile) => (
                      <tr key={profile.profileId}>
                        <td>{getCommonName(customer.profiles)}</td>
                        <td>
                          {editingProfile?.profileId === profile.profileId ? (
                            <input
                              type="text"
                              name="name"
                              value={editedProfile.name}
                              onChange={handleEditChange}
                              className="inline-edit-input"
                            />
                          ) : (
                            profile.name
                          )}
                        </td>
                        <td>₹{profile.advanceGiven}</td>
                        <td>₹{profile.advanceUsed}</td>
                        <td>₹{profile.balance}</td>
                        <td>
                          {editingProfile?.profileId === profile.profileId ? (
                            <select
                              name="paymentMethod"
                              value={editedProfile.paymentMethod}
                              onChange={handleEditChange}
                              className="inline-edit-select"
                            >
                              <option value="Cash">Cash</option>
                              <option value="Online">Online</option>
                              <option value="Card">Card</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          ) : (
                            profile.paymentMethod
                          )}
                        </td>
                        <td>
                          <button
                            className="show-bills-btn"
                            onClick={() =>
                              handleShowBills(
                                profile.bills,
                                profile.paymentMethod,
                                profile.name,
                                customer.phoneNumber
                              )
                            }
                            disabled={profile.bills.length === 0}
                          >
                            Show Bills
                          </button>
                        </td>
                        <td>
                          {editingProfile?.profileId === profile.profileId ? (
                            <button
                              className="save-btn"
                              onClick={handleSaveEdit}
                            >
                              <Save size={16} />
                            </button>
                          ) : (
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditStart(profile, customer.phoneNumber)
                              }
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bill Modal */}
      {selectedBills && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseModal}>
              Close
            </button>
            <h2>Bill Details for {selectedBills.profileName}</h2>
            <p>Phone Number: {selectedBills.phoneNumber}</p>
            {selectedBills.bills.length === 0 ? (
              <p>No bills available for this profile.</p>
            ) : (
              selectedBills.bills.map((bill) => (
                <div key={bill.billNo} className="bill-details">
                  <h3>Bill No: {bill.billNo}</h3>
                  <p>Date: {bill.date || "N/A"}</p>
                  <p>Payment Method: {selectedBills.paymentMethod}</p>
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
                      <tr className="total">
                        <td colSpan="3">Advance Remaining</td>
                        <td>₹{bill.advanceRemaining}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    className="print-btn"
                    onClick={() =>
                      handlePrintBill(
                        bill,
                        selectedBills.paymentMethod,
                        selectedBills.profileName,
                        selectedBills.phoneNumber
                      )
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