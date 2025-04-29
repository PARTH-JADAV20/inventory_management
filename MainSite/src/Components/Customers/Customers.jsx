import React, { useState, useEffect, useRef } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";
import { fetchCustomers as apiGetCustomers, updateCustomerProfile, softDeleteCustomerProfile, restoreCustomerProfile, permanentDeleteCustomerProfile } from "../api.js";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]); // Customers for active shop
  const [deletedProfiles, setDeletedProfiles] = useState([]); // Deleted profiles for active shop
  const [shop, setShop] = useState("Shop 1"); // Active shop
  const [searchTerm, setSearchTerm] = useState("");
  const [editedProfile, setEditedProfile] = useState(null);
  const [selectedBills, setSelectedBills] = useState(null);
  const [selectedAdvanceDetails, setSelectedAdvanceDetails] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false); // Toggle deleted profiles section
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const shopApiName = shop === "Shop 1" ? "shop1" : "shop2";

  // Derive common name from profiles
  const getCommonName = (profiles) => {
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return "Unknown";
    }
    const names = profiles.map((p) => p.name.replace(/ \[.*\]$/, ""));
    return names[0] || "Unknown";
  };

  // Calculate total purchased (sum of bill totalAmounts)
  const calculateTotalPurchased = (bills) => {
    if (!bills || !Array.isArray(bills)) {
      return 0;
    }
    return bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  };

  // Fetch customers and deleted profiles
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch active customers
      const activeData = await apiGetCustomers(shopApiName, searchTerm, false);
      const updatedCustomers = activeData.map((customer) => ({
        ...customer,
        profiles: Array.isArray(customer.profiles) 
          ? customer.profiles
              .map((profile) => ({
                ...profile,
                creationTime: parseInt(profile.profileId.split("-")[1]),
              }))
              .sort((a, b) => a.creationTime - b.creationTime)
          : []
      }));
      setCustomers(updatedCustomers);

      // Fetch deleted profiles
      const deletedData = await apiGetCustomers(shopApiName, searchTerm, true);
      const deletedProfiles = deletedData
        .flatMap((c) => {
          if (!Array.isArray(c.profiles)) return [];
          return c.profiles
            .filter((p) => p.deleteuser?.value)
            .map((p) => ({
              ...p,
              phoneNumber: c.phoneNumber,
              commonName: getCommonName(c.profiles),
            }));
        })
        .filter((p) => {
          if (!p.deleteuser?.date) return false;
          const deletionDate = new Date(p.deleteuser.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return deletionDate > thirtyDaysAgo; // Keep profiles deleted within 30 days
        });
      setDeletedProfiles(deletedProfiles);

      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Fetch customers on shop change or search term update
  useEffect(() => {
    fetchCustomers();
  }, [shop, searchTerm]);

  // Auto-remove deleted profiles after 30 days
  useEffect(() => {
    const checkDeletedProfiles = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const profilesToDelete = deletedProfiles.filter((p) => {
        if (!p.deleteuser?.date) return false;
        const deletionDate = new Date(p.deleteuser.date);
        return deletionDate <= thirtyDaysAgo;
      });

      for (const profile of profilesToDelete) {
        try {
          await permanentDeleteCustomerProfile(shopApiName, profile.phoneNumber, profile.profileId);
        } catch (err) {
          console.error(`Failed to permanently delete profile ${profile.profileId}:`, err);
        }
      }

      // Refresh customers and deleted profiles
      await fetchCustomers();
    };

    checkDeletedProfiles();
    const interval = setInterval(checkDeletedProfiles, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, [shop]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      (getCommonName(customer.profiles)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm)) &&
      Array.isArray(customer.profiles) && 
      customer.profiles.some((p) => !p.deleteuser?.value)
  );

  // Filter deleted profiles based on search term
  const filteredDeletedProfiles = deletedProfiles.filter(
    (profile) =>
      (profile.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.phoneNumber.includes(searchTerm)) &&
      profile.deleteuser?.value
  );

  // Summary statistics
  const totalCustomers = customers.length;
  const advanceCustomers = customers.filter((c) =>
    Array.isArray(c.profiles) && c.profiles.some((p) => p.advance?.value)
  ).length;

  // Handle edit
  const handleEdit = (profile, phoneNumber, commonName) => {
    const customer = customers.find((c) => c.phoneNumber === phoneNumber);
    setEditedProfile({
      ...profile,
      phoneNumber, // Store original phoneNumber
      originalPhoneNumber: phoneNumber, // Add original phoneNumber for reference
      name: profile.name, // Ensure name is set to current profile name
      commonName: getCommonName(customer?.profiles || []),
      paymentType: profile.advance?.paymentType || profile.paymentType || "Cash",
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const customer = customers.find((c) => c.phoneNumber === editedProfile.originalPhoneNumber);
      if (!customer) {
        setError("Customer not found");
        alert("Customer not found");
        return;
      }

      // Validate name is present
      if (!editedProfile.name || editedProfile.name.trim() === "") {
        setError("Name is required");
        alert("Name is required");
        return;
      }

      const updateData = {
        name: editedProfile.name, // Always include name
        advance: editedProfile.advance
          ? { ...editedProfile.advance, paymentType: editedProfile.paymentType }
          : undefined,
      };

      // Include newPhoneNumber if phone number has changed
      if (editedProfile.phoneNumber !== editedProfile.originalPhoneNumber) {
        updateData.newPhoneNumber = editedProfile.phoneNumber; // Send newPhoneNumber
      }

      // Update the current profile
      await updateCustomerProfile(
        shopApiName,
        editedProfile.originalPhoneNumber, // Use original phoneNumber
        editedProfile.profileId,
        updateData
      );

      // Update contractor name if changed
      if (Array.isArray(customer.profiles) && customer.profiles.length > 0) {
        const firstProfile = customer.profiles[0];
        if (
          firstProfile &&
          editedProfile.commonName !== getCommonName(customer.profiles) &&
          editedProfile.profileId !== firstProfile.profileId
        ) {
          const firstProfileName = editedProfile.commonName + (firstProfile.name.match(/ \[.*\]$/) || "");
          await updateCustomerProfile(shopApiName, editedProfile.originalPhoneNumber, firstProfile.profileId, {
            name: firstProfileName,
          });
        }
      }

      await fetchCustomers();
      setEditedProfile(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
    setLoading(false);
  };

  // Handle delete profile
  const handleDeleteProfile = async (profileId, phoneNumber) => {
    if (!window.confirm(`Are you sure you want to delete this profile?`)) return;
    setLoading(true);
    try {
      await softDeleteCustomerProfile(shopApiName, phoneNumber, profileId);
      await fetchCustomers();
      setError(null);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
    setLoading(false);
  };

  // Handle restore profile
  const handleRestoreProfile = async (profileId, phoneNumber) => {
    setLoading(true);
    try {
      await restoreCustomerProfile(shopApiName, phoneNumber, profileId);
      await fetchCustomers();
      setError(null);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
    setLoading(false);
  };

  // Handle permanent delete
  const handlePermanentDelete = async (profileId, phoneNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete this profile?`)) return;
    setLoading(true);
    try {
      await permanentDeleteCustomerProfile(shopApiName, phoneNumber, profileId);
      await fetchCustomers();
      setError(null);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
    setLoading(false);
  };

  // Handle input change for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  // Handle show bills
  const handleShowBills = (bills, paymentType, profileName, phoneNumber) => {
    setSelectedBills({ 
      bills: Array.isArray(bills) ? bills : [], 
      paymentType, 
      profileName, 
      phoneNumber 
    });
    setSelectedAdvanceDetails(null);
  };

  // Handle close bills modal
  const handleCloseBillsModal = () => {
    setSelectedBills(null);
  };

  // Handle advance details popup
  const handleShowAdvanceDetails = (profile, phoneNumber) => {
    const totalDeposits = profile.advanceHistory && Array.isArray(profile.advanceHistory)
      ? profile.advanceHistory
        .filter((h) => h.transactionType === "Deposit")
        .reduce((sum, h) => sum + h.amount, 0)
      : 0;
    
    const bills = Array.isArray(profile.bills) ? profile.bills : [];
    const totalUsed = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle print bill
  const handlePrintBill = (bill, paymentType, profileName, phoneNumber) => {
    const customer = customers.find((c) => c.phoneNumber === phoneNumber);
    const profile = customer && Array.isArray(customer.profiles)
      ? customer.profiles.find((p) => p.name === profileName)
      : null;

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
            .payment-type { margin-top: 10px; font-style: italic; }
          </style>
        </head>
        <body>
          <h2>Bill No: ${bill.billNo}</h2>
          <p>Profile Name: ${profileName}</p>
          <p>Phone Number: ${phoneNumber}</p>
          <p>Date: ${bill.date || "N/A"}</p>
          <p class="payment-type">Payment Type: ${paymentType ?? "N/A"}</p>
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
               ${Array.isArray(bill.items) ? bill.items.map((item) => `
                <tr>
                  <td>${item.product || 'N/A'}</td>
                  <td>${item.qty || 0}</td>
                  <td>₹${item.pricePerQty || 0}</td>
                  <td>₹${item.amount || 0}</td>
                </tr>
               `).join("") : ''}
              <tr class="total">
                <td colspan="3">Total Amount</td>
                <td>₹${bill.totalAmount || 0}</td>
              </tr>
              ${profile && profile.advance?.value && bill.advanceRemaining !== undefined ? `
                <tr class="total">
                  <td colspan="3">Advance Remaining</td>
                  <td>₹${bill.advanceRemaining}</td>
                </tr>
              ` : ""}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="main-content">
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
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
                <th>Payment Type</th>
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
                          {commonName} ({Array.isArray(customer.profiles) ? customer.profiles.filter((p) => !p.deleteuser?.value).length : 0} profiles)
                        </button>
                      </td>
                    </tr>
                    {Array.isArray(customer.profiles) ? 
                      customer.profiles
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
                                  name="paymentType"
                                  value={editedProfile.paymentType}
                                  onChange={handleInputChange}
                                  className="inline-edit-input-p2"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="Online">Online</option>
                                  <option value="Card">Card</option>
                                  <option value="Cheque">Cheque</option>
                                </select>
                              ) : (
                                (profile.advance?.paymentType || profile.paymentType) ??
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
                                    profile.bills || [],
                                    profile.advance?.paymentType || profile.paymentType,
                                    profile.name,
                                    customer.phoneNumber
                                  )
                                }
                                disabled={!Array.isArray(profile.bills) || profile.bills.length === 0}
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
                                      handleEdit(profile, customer.phoneNumber, commonName)
                                    }
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    className="delete-btn-p2"
                                    onClick={() =>
                                      handleDeleteProfile(profile.profileId, customer.phoneNumber)
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      : null}
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
                  <td>{profile.deleteuser?.date || "N/A"}</td>
                  <td>
                    <button
                      className="restore-btn"
                      onClick={() =>
                        handleRestoreProfile(profile.profileId, profile.phoneNumber)
                      }
                    >
                      Restore
                    </button>
                    <button
                      className="delete-btn-p2"
                      onClick={() =>
                        handlePermanentDelete(profile.profileId, profile.phoneNumber)
                      }
                    >
                      <div style={{ display: "flex" }}>
                        <Trash2 size={16} /> Delete Permanent
                      </div>
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
            <h3>Advance History</h3>
            {Array.isArray(selectedAdvanceDetails.advanceHistory) && selectedAdvanceDetails.advanceHistory.length > 0 ? (
              <table className="history-table-p2">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAdvanceDetails.advanceHistory.map((entry, index) => (
                    <tr key={index}>
                      <td>{formatDate(entry.date)}</td>
                      <td>{entry.transactionType}</td>
                      <td>₹{entry.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No advance history available.</p>
            )}
            <button
              className="show-bills-btn-p2"
              onClick={() =>
                handleShowBills(
                  Array.isArray(selectedAdvanceDetails.bills) ? selectedAdvanceDetails.bills : [],
                  selectedAdvanceDetails.advance?.paymentType ||
                  selectedAdvanceDetails.paymentType,
                  selectedAdvanceDetails.name,
                  selectedAdvanceDetails.phoneNumber
                )
              }
              disabled={!Array.isArray(selectedAdvanceDetails.bills) || selectedAdvanceDetails.bills.length === 0}
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
            {!Array.isArray(selectedBills.bills) || selectedBills.bills.length === 0 ? (
              <p>No bills available for this profile.</p>
            ) : (
              selectedBills.bills.map((bill) => (
                <div key={bill.billNo} className="bill-details">
                  <h3>Bill No: {bill.billNo}</h3>
                  <p>Date: {bill.date || "N/A"}</p>
                  <p>Payment Type: {selectedBills.paymentType ?? "N/A"}</p>
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
                      {Array.isArray(bill.items) ? bill.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.pricePerQty}</td>
                          <td>₹{item.amount}</td>
                        </tr>
                      )) : null}
                      <tr className="total">
                        <td colSpan={3}>Total Amount</td>
                        <td>₹{bill.totalAmount}</td>
                      </tr>
                      {selectedBills.bills.length > 0 && selectedBills.bills[0].advanceRemaining !== undefined && (
                        <tr className="total">
                          <td colSpan={3}>Advance Remaining</td>
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
                        selectedBills.paymentType,
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