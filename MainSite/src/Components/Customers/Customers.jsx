import React, { useState, useEffect } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import { customersData, customersData2 } from "../customers";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState(customersData); // Shop 1 customers
  const [customers2, setCustomers2] = useState(customersData2); // Shop 2 customers
  const [deletedProfiles, setDeletedProfiles] = useState({ "Shop 1": [], "Shop 2": [] }); // Track deleted profiles
  const [shop, setShop] = useState("Shop 1"); // Active shop
  const [searchTerm, setSearchTerm] = useState("");
  const [editedProfile, setEditedProfile] = useState(null);
  const [selectedBills, setSelectedBills] = useState(null);
  const [selectedAdvanceDetails, setSelectedAdvanceDetails] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false); // Toggle deleted profiles section

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
    const updateCustomers = (customerList, setCustomerList) => {
      const updatedCustomers = customerList.map((customer) => ({
        ...customer,
        profiles: customer.profiles
          .map((profile) => ({
            ...profile,
            lastUpdated:
              profile.bills.length > 0
                ? new Date(
                    profile.bills[profile.bills.length - 1].date
                      .split(" ")
                      .reverse()
                      .join("-")
                  )
                : new Date(parseInt(profile.profileId.split("-")[1])), // Proxy from profileId
          }))
          .sort((a, b) => b.lastUpdated - a.lastUpdated),
      }));
      setCustomerList(updatedCustomers);
    };
    updateCustomers(customers, setCustomers);
    updateCustomers(customers2, setCustomers2);
  }, [shop]);

  // Auto-remove deleted profiles after 30 days
  useEffect(() => {
    const checkDeletedProfiles = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      setDeletedProfiles((prev) => {
        const updatedDeleted = { ...prev };
        updatedDeleted[shop] = prev[shop].filter((deletedProfile) => {
          const deletionDate = new Date(deletedProfile.deleteuser.date);
          return deletionDate > thirtyDaysAgo;
        });
        return updatedDeleted;
      });
    };

    checkDeletedProfiles();
    const interval = setInterval(checkDeletedProfiles, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, [shop]);

  // Filter customers based on search term (common name or phone number)
  const filteredCustomers = (shop === "Shop 1" ? customers : customers2)
    .filter((customer) => customer.profiles.some((p) => !p.deleteuser?.value))
    .filter(
      (customer) =>
        getCommonName(customer.profiles)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm)
    );

  // Filter deleted profiles based on search term
  const filteredDeletedProfiles = deletedProfiles[shop].filter(
    (profile) =>
      (profile.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.phoneNumber.includes(searchTerm)) &&
      profile.deleteuser?.value
  );

  // Summary statistics
  const totalCustomers = (shop === "Shop 1" ? customers : customers2).length; // Unique phone numbers
  const advanceCustomers = (shop === "Shop 1" ? customers : customers2).filter(
    (c) => c.profiles.some((p) => p.advance?.value)
  ).length;

  // Handle edit
  const handleEdit = (profile, phoneNumber, commonName, shop) => {
    setEditedProfile({ ...profile, phoneNumber, commonName, shop });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    const setActiveCustomers = editedProfile.shop === "Shop 1" ? setCustomers : setCustomers2;
    const activeCustomers = editedProfile.shop === "Shop 1" ? customers : customers2;
    setActiveCustomers(
      activeCustomers.map((c) =>
        c.phoneNumber === editedProfile.phoneNumber
          ? {
              ...c,
              phoneNumber: editedProfile.phoneNumber,
              profiles: c.profiles.map((p) => ({
                ...p,
                name:
                  p.profileId === editedProfile.profileId
                    ? editedProfile.name
                    : p.name.replace(/^.*?(?=\s*\[|$)/, editedProfile.commonName),
                advance:
                  p.profileId === editedProfile.profileId && p.advance
                    ? { ...p.advance, paymentMethod: editedProfile.paymentMethod }
                    : p.advance,
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

  // Handle delete profile
  const handleDeleteProfile = (profileId, phoneNumber, shop) => {
    if (!window.confirm(`Are you sure you want to delete this profile?`)) return;
    const setActiveCustomers = shop === "Shop 1" ? setCustomers : setCustomers2;
    const activeCustomers = shop === "Shop 1" ? customers : customers2;

    // Find the customer and profile to move to deleted section
    const customer = activeCustomers.find((c) => c.phoneNumber === phoneNumber);
    const profileToDelete = customer.profiles.find((p) => p.profileId === profileId);
    const commonName = getCommonName(customer.profiles);

    // Mark the profile as deleted with the current date
    const updatedCustomers = activeCustomers.map((c) =>
      c.phoneNumber === phoneNumber
        ? {
            ...c,
            profiles: c.profiles.map((p) =>
              p.profileId === profileId
                ? {
                    ...p,
                    deleteuser: { value: true, date: new Date().toISOString().split("T")[0] },
                  }
                : p
            ),
          }
        : c
    );

    // Add the deleted profile to deletedProfiles
    setDeletedProfiles((prev) => ({
      ...prev,
      [shop]: [
        ...prev[shop],
        {
          ...profileToDelete,
          phoneNumber,
          commonName,
          deleteuser: { value: true, date: new Date().toISOString().split("T")[0] },
        },
      ],
    }));

    // Update active customers
    setActiveCustomers(updatedCustomers);
  };

  // Handle restore profile
  const handleRestoreProfile = (profileId, phoneNumber, shop) => {
    const setActiveCustomers = shop === "Shop 1" ? setCustomers : setCustomers2;
    const activeCustomers = shop === "Shop 1" ? customers : customers2;

    // Remove the deleteuser flag to restore the profile
    setActiveCustomers(
      activeCustomers.map((c) =>
        c.phoneNumber === phoneNumber
          ? {
              ...c,
              profiles: c.profiles.map((p) =>
                p.profileId === profileId
                  ? { ...p, deleteuser: { value: false, date: "" } }
                  : p
              ),
            }
          : c
      )
    );

    // Remove from deleted profiles
    setDeletedProfiles((prev) => ({
      ...prev,
      [shop]: prev[shop].filter((p) => p.profileId !== profileId),
    }));
  };

  // Handle permanent delete
  const handlePermanentDelete = (profileId, shop) => {
    if (!window.confirm(`Are you sure you want to permanently delete this profile?`)) return;
    setDeletedProfiles((prev) => ({
      ...prev,
      [shop]: prev[shop].filter((p) => p.profileId !== profileId),
    }));
  };

  // Handle input change for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  // Handle show bills
  const handleShowBills = (bills, paymentMethod, profileName, phoneNumber) => {
    setSelectedBills({ bills, paymentMethod, profileName, phoneNumber });
    setSelectedAdvanceDetails(null); // Close advance popup if open
  };

  // Handle close bills modal
  const handleCloseBillsModal = () => {
    setSelectedBills(null);
  };

  // Handle advance details popup
  const handleShowAdvanceDetails = (profile, phoneNumber) => {
    const totalDeposits = profile.advanceHistory
      ? profile.advanceHistory
          .filter((h) => h.transactionType === "Deposit")
          .reduce((sum, h) => sum + h.amount, 0)
      : 0;
    const totalUsed = profile.bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const balance = profile.advance?.currentamount || 0;

    setSelectedAdvanceDetails({
      ...profile,
      phoneNumber,
      advanceGiven: totalDeposits,
      advanceUsed: totalUsed,
      balance,
    });
  };

  // Handle close advance modal
  const handleCloseAdvanceModal = () => {
    setSelectedAdvanceDetails(null);
  };

  // Handle print bill
  const handlePrintBill = (bill, paymentMethod, profileName, phoneNumber) => {
    const activeCustomers = shop === "Shop 1" ? customers : customers2;
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

    const profile = activeCustomers
      .find((c) => c.phoneNumber === phoneNumber)
      ?.profiles.find((p) => p.name === profileName);
    if (profile && profile.advance?.value && bill.advanceRemaining !== undefined) {
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
        <div className="shop-selector-p2">
          <label>Shop</label>
          <select
            value={shop}
            onChange={(e) => {
              setShop(e.target.value);
              setSearchTerm("");
              setEditedProfile(null);
              setSelectedBills(null);
              setSelectedAdvanceDetails(null);
              setShowDeleted(false);
            }}
          >
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <h2>Customer Management - {shop}</h2>
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
        <button
          className="toggle-deleted-btn"
          onClick={() => setShowDeleted(!showDeleted)}
        >
          {showDeleted ? "Hide Recently Deleted" : "Show Recently Deleted"}
        </button>
      </div>

      {!showDeleted ? (
        <div className="customers-table-container-p2">
          <table className="customers-table-p2">
            <thead>
              <tr>
                <th>Contractor</th>
                <th>Phone Number</th>
                <th>Profile</th>
                <th>Total Purchased</th>
                <th>Payment Method</th>
                <th>Advance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const commonName = getCommonName(customer.profiles);
                return (
                  <React.Fragment key={customer.phoneNumber}>
                    <tr className="contractor-row">
                      <td colSpan={7}>
                        <button className="contractor-toggle">
                          {commonName} ({customer.profiles.length} profiles)
                        </button>
                      </td>
                    </tr>
                    {customer.profiles
                      .filter((profile) => !profile.deleteuser?.value)
                      .map((profile) => (
                        <tr key={profile.profileId}>
                          <td>
                            {editedProfile &&
                            editedProfile.profileId === profile.profileId ? (
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
                            {editedProfile &&
                            editedProfile.profileId === profile.profileId ? (
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
                            {editedProfile &&
                            editedProfile.profileId === profile.profileId ? (
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
                            {editedProfile &&
                            editedProfile.profileId === profile.profileId ? (
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
                              (profile.advance?.paymentMethod || profile.paymentMethod) ??
                              "N/A"
                            )}
                          </td>
                          <td>
                            {profile.advance?.value ? (
                              <button
                                className="advance-details-btn-p2"
                                onClick={() =>
                                  handleShowAdvanceDetails(profile, customer.phoneNumber)
                                }
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
                                  profile.advance?.paymentMethod || profile.paymentMethod,
                                  profile.name,
                                  customer.phoneNumber
                                )
                              }
                              disabled={profile.bills.length === 0}
                            >
                              Show Bills
                            </button>
                            {editedProfile &&
                            editedProfile.profileId === profile.profileId ? (
                              <button className="save-btn-p2" onClick={handleSaveEdit}>
                                <Save size={16} />
                              </button>
                            ) : (
                              <>
                                <button
                                  className="edit-btn-p2"
                                  onClick={() =>
                                    handleEdit(profile, customer.phoneNumber, commonName, shop)
                                  }
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  className="delete-btn-p2"
                                  onClick={() =>
                                    handleDeleteProfile(
                                      profile.profileId,
                                      customer.phoneNumber,
                                      shop
                                    )
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="customers-table-container-p2">
          <h3>Recently Deleted Profiles - {shop}</h3>
          <table className="customers-table-p2">
            <thead>
              <tr>
                <th>Contractor</th>
                <th>Phone Number</th>
                <th>Profile</th>
                <th>Deletion Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeletedProfiles.map((profile) => (
                <tr key={profile.profileId}>
                  <td>{profile.commonName}</td>
                  <td>{profile.phoneNumber}</td>
                  <td>{profile.name}</td>
                  <td>{profile.deleteuser.date}</td>
                  <td>
                    <button
                      className="restore-btn"
                      onClick={() =>
                        handleRestoreProfile(profile.profileId, profile.phoneNumber, shop)
                      }
                    >
                      Restore
                    </button>
                    <button
                      className="delete-btn-p2"
                      onClick={() => handlePermanentDelete(profile.profileId, shop)}
                    >
                      <div style={{display:"flex"}}><Trash2 size={16} /> Delete Permanent</div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                  selectedAdvanceDetails.advance?.paymentMethod ||
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
                  <p>Payment Method: {selectedBills.paymentMethod ?? "N/A"}</p>
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