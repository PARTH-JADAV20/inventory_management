import React, { useState, useEffect } from "react";
import { Pencil, Save } from "lucide-react";
import customersData from "../customers";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState(customersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedProfile, setEditedProfile] = useState(null);
  const [selectedBills, setSelectedBills] = useState(null);
  const [selectedAdvanceDetails, setSelectedAdvanceDetails] = useState(null);
  // Derive common name from profiles
  const getCommonName = (profiles) => {
    const names = profiles.map((p) => p.name.replace(/ \[.*\]$/, ""));
    return names[0] || "Unknown";
  };

  // Calculate total purchased (sum of bill totalAmounts)
  const calculateTotalPurchased = (bills) => {
    return bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  };

  // Sort customers by last updated (using the latest bill date or profileId timestamp)
  useEffect(() => {
    const updatedCustomers = customers.map((customer) => ({
      ...customer,
      profiles: customer.profiles
        .map((profile) => ({
          ...profile,
          lastUpdated:
            profile.bills.length > 0
              ? new Date(profile.bills[profile.bills.length - 1].date)
              : new Date(parseInt(profile.profileId.split("-")[1])), // Proxy from profileId
        }))
        .sort((a, b) => b.lastUpdated - a.lastUpdated),
    }));
    setCustomers(updatedCustomers);
  }, []);

  // Filter customers based on search term (common name or phone number)
  const filteredCustomers = customers.filter(
    (customer) =>
      getCommonName(customer.profiles).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
  );

  // Summary statistics
  const totalCustomers = customers.length; // Unique phone numbers
  const advanceCustomers = customers.filter((c) => c.profiles.some((p) => p.advance)).length;

  // Handle edit
  const handleEdit = (profile, phoneNumber, commonName) => {
    setEditedProfile({ ...profile, phoneNumber, commonName });
  };

  const handleSaveEdit = () => {
    setCustomers(
      customers.map((c) =>
        c.phoneNumber === editedProfile.phoneNumber
          ? {
            ...c,
            phoneNumber: editedProfile.phoneNumber,
            profiles: c.profiles.map((p) => ({
              ...p,
              name:
                p.profileId === editedProfile.profileId
                  ? editedProfile.name
                  : p.name.replace(
                    /^.*?(?=\s*\[|$)/,
                    editedProfile.commonName
                  ),
              paymentMethod:
                p.profileId === editedProfile.profileId
                  ? editedProfile.paymentMethod
                  : p.paymentMethod,
              lastUpdated:
                p.profileId === editedProfile.profileId
                  ? new Date()
                  : p.lastUpdated,
            })),
          }
          : c
      )
    );
    setEditedProfile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };


  // Handle show bills
  const handleShowBills = (bills, paymentMethod, profileName, phoneNumber) => {
    setSelectedBills({ bills, paymentMethod, profileName, phoneNumber });
    setSelectedAdvanceDetails(null); // Close advance popup if open
  };

  const handleCloseBillsModal = () => {
    setSelectedBills(null);
  };

  // Handle advance details popup
  const handleShowAdvanceDetails = (profile, phoneNumber) => {
    setSelectedAdvanceDetails({ ...profile, phoneNumber });
  };

  const handleCloseAdvanceModal = () => {
    setSelectedAdvanceDetails(null);
  };

  // Handle print bill
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
    `;

    const profile = customers
      .find((c) => c.phoneNumber === phoneNumber)
      ?.profiles.find((p) => p.name === profileName);
    if (profile && profile.advance && bill.advanceRemaining !== undefined) {
      billContent += `
              <tr class="total">
                <td colspan="3">Advance Remaining</td>
                <td>₹${bill.advanceRemaining}</td>
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
        <tbody className="customers-table-p2">
          {filteredCustomers.map((customer) => {
            const commonName = getCommonName(customer.profiles);
            return (
              <React.Fragment key={customer.phoneNumber}>
                <tr>
                  <td colSpan={7}>
                    <h5 className="contractor-heading">
                      {commonName} ({customer.profiles.length} profiles)
                    </h5>
                  </td>
                </tr>
                {customer.profiles.map((profile) => (
                  <tr key={profile.profileId}>
                    <td>
                      {editedProfile && editedProfile.profileId === profile.profileId ? (
                        <input
                          type="text"
                          name="commonName"
                          value={editedProfile.commonName}
                          onChange={handleInputChange}
                          className="inline-edit-input-p2"
                        />
                      ) : (
                        commonName
                      )}
                    </td>
                    <td>
                      {editedProfile && editedProfile.profileId === profile.profileId ? (
                        <input
                          type="text"
                          name="phoneNumber"
                          value={editedProfile.phoneNumber}
                          onChange={handleInputChange}
                          className="inline-edit-input-p2"
                        />
                      ) : (
                        customer.phoneNumber
                      )}
                    </td>
                    <td>
                      {editedProfile && editedProfile.profileId === profile.profileId ? (
                        <input
                          type="text"
                          name="name"
                          value={editedProfile.name}
                          onChange={handleInputChange}
                          className="inline-edit-input-p2"
                        />
                      ) : (
                        profile.name
                      )}
                    </td>
                    <td>₹{calculateTotalPurchased(profile.bills)}</td>
                    <td>
                      {editedProfile && editedProfile.profileId === profile.profileId ? (
                        <select
                          name="paymentMethod"
                          value={editedProfile.paymentMethod}
                          onChange={handleInputChange}
                          className="inline-edit-input-p2"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Online">Online</option>
                          <option value="Card">Card</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      ) : (
                        profile.paymentMethod || "N/A"
                      )}
                    </td>
                    <td>
                      {profile.advance ? (
                        <button
                          className="advance-details-btn-p2"
                          onClick={() => handleShowAdvanceDetails(profile, customer.phoneNumber)}
                        >
                          Advance Details
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        className="show-bills-btn-p2"
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
                      {editedProfile && editedProfile.profileId === profile.profileId ? (
                        <button className="save-btn-p2" onClick={handleSaveEdit}>
                          <Save size={16} />
                        </button>
                      ) : (
                        <button
                          className="edit-btn-p2"
                          onClick={() => handleEdit(profile, customer.phoneNumber, commonName)}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </div>

      {/* Advance Details Modal */}
      {selectedAdvanceDetails && (
        <div className="modal-overlay">
          <div className="modal-content advance-modal-content-p2">
            <button className="close-btn" onClick={handleCloseAdvanceModal}>
              Close
            </button>
            <h2>Advance Details for {selectedAdvanceDetails.name}</h2>
            <div className="advance-details-content-p2">
              <p>
                <strong>Advance Given:</strong> ₹{selectedAdvanceDetails.advanceGiven || 0}
              </p>
              <p>
                <strong>Advance Used:</strong> ₹{selectedAdvanceDetails.advanceUsed || 0}
              </p>
              <p>
                <strong>Balance:</strong> ₹{selectedAdvanceDetails.balance || 0}
              </p>
            </div>
            <button
              className="show-bills-btn-p2"
              onClick={() =>
                handleShowBills(
                  selectedAdvanceDetails.bills,
                  selectedAdvanceDetails.paymentMethod,
                  selectedAdvanceDetails.name,
                  selectedAdvanceDetails.phoneNumber
                )
              }
              disabled={selectedAdvanceDetails.bills.length === 0}
            >
              Show Bills
            </button>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {selectedBills && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseBillsModal}>
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
                      {selectedBills.bills[0].advanceRemaining !== undefined && (
                        <tr className="total">
                          <td colSpan="3">Advance Remaining</td>
                          <td>₹{bill.advanceRemaining}</td>
                        </tr>
                      )}
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

export default Customers;