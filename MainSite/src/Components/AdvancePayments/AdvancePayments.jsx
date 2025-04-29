import React, { useState, useEffect } from "react";
import { Pencil, Save, Trash2, MoreVertical, Receipt, History } from "lucide-react";
import * as apiService from "../api";  // Import everything from api as a namespace
import "./AdvancePayments.css";

const AdvancePayments = () => {
  const [customers, setCustomers] = useState([]);
  const [shop, setShop] = useState("Shop 1");
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    phoneNumber: "",
    profileId: "",
    advanceAmount: "",
    newProfileName: "",
    paymentType: "Cash",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBills, setSelectedBills] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shopApiName = shop === "Shop 1" ? "shop1" : "shop2";

  const getCommonName = (profiles) => {
    const names = (profiles || []).map((p) => (p.name || "Unknown").replace(/ \[.*\]$/, ""));
    return names[0] || "Unknown";
  };

  // Changed function name to avoid conflict with imported API function
  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Use the imported API function through the namespace
      const data = await apiService.fetchCustomers(shopApiName, searchTerm, false);
      console.log("Fetched customers:", data);
      setCustomers(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(`Failed to load customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [shop, searchTerm]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "customerName" && isExistingCustomer) {
      const match = value.match(/^(.+)\s*\((\d+)\)$/);
      if (match) {
        const [, commonName, phoneNumber] = match;
        setNewPayment({ ...newPayment, customerName: commonName, phoneNumber, profileId: "", newProfileName: "" });
      } else {
        setNewPayment({ ...newPayment, customerName: value, phoneNumber: "", profileId: "", newProfileName: "" });
      }
    } else if (name === "phoneNumber" && isExistingCustomer) {
      try {
        const customer = await apiService.fetchCustomerByPhone(shopApiName, value);
        setNewPayment({
          ...newPayment,
          phoneNumber: value,
          customerName: customer ? getCommonName(customer.profiles) : "",
          profileId: "",
          newProfileName: "",
        });
      } catch (err) {
        console.error("Error fetching customer by phone:", err);
        setNewPayment({ ...newPayment, phoneNumber: value, customerName: "", profileId: "", newProfileName: "" });
      }
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    setIsExistingCustomer(e.target.checked);
    setNewPayment({
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      phoneNumber: "",
      profileId: "",
      advanceAmount: "",
      newProfileName: "",
      paymentType: "Cash",
    });
  };

  const handleAddPayment = async () => {
    if (
      !newPayment.date ||
      !newPayment.customerName ||
      !newPayment.phoneNumber ||
      (!newPayment.profileId && !isExistingCustomer) ||
      !newPayment.advanceAmount ||
      !newPayment.paymentType
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (newPayment.profileId.startsWith("new-profile") && !newPayment.newProfileName) {
      alert("Please enter a profile name");
      return;
    }

    const advanceAmount = parseFloat(newPayment.advanceAmount);
    if (advanceAmount === 0) {
      alert("Advance amount cannot be zero");
      return;
    }

    setLoading(true);
    try {
      const existingCustomer = customers.find((c) => c.phoneNumber === newPayment.phoneNumber);

      if (!isExistingCustomer && existingCustomer) {
        alert("Phone number exists. Use Existing Customer option.");
        return;
      }

      if (existingCustomer && newPayment.profileId.startsWith("new-profile")) {
        // Check for exact duplicate profile names (case-sensitive)
        if (existingCustomer.profiles.some((p) => p.name === newPayment.newProfileName)) {
          alert("Profile name already exists for this customer");
          return;
        }
      }

      if (existingCustomer && !newPayment.profileId.startsWith("new-profile")) {
        const profile = existingCustomer.profiles.find((p) => p.profileId === newPayment.profileId);
        if (!profile) {
          alert("Selected profile not found");
          return;
        }
        if (advanceAmount < 0 && (profile.advance?.currentamount || 0) < Math.abs(advanceAmount)) {
          alert("Refund amount cannot exceed the current advance balance.");
          return;
        }
        console.log("addAdvancePayment request:", {
          date: newPayment.date,
          amount: advanceAmount,
          paymentType: newPayment.paymentType,
        });
        await apiService.addAdvancePayment(shopApiName, newPayment.phoneNumber, newPayment.profileId, {
          date: newPayment.date,
          amount: advanceAmount,
          paymentType: newPayment.paymentType,
        });
      } else {
        if (advanceAmount < 0) {
          alert("Cannot create a new customer with a refund. Please add a deposit first.");
          return;
        }
        const profileData = {
          name: newPayment.profileId.startsWith("new-profile") ? newPayment.newProfileName : newPayment.customerName,
          advance: { value: true, currentamount: advanceAmount, showinadvance: true, paymentType: newPayment.paymentType },
          paymentType: newPayment.paymentType,
          credit: 0,
          advanceHistory: [
            {
              transactionType: "Deposit",
              amount: advanceAmount,
              date: newPayment.date,
            },
          ],
        };
        const customerData = {
          phoneNumber: newPayment.phoneNumber,
          profiles: [profileData],
        };
        console.log("createCustomer request:", customerData);
        await apiService.createCustomer(shopApiName, customerData);
      }

      await loadCustomers();
      setNewPayment({
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        phoneNumber: "",
        profileId: "",
        advanceAmount: "",
        newProfileName: "",
        paymentType: "Cash",
      });
      setIsExistingCustomer(false);
      setError(null);
    } catch (err) {
      console.error("Error adding payment:", err);
      setError(`Failed to add payment: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (profile, phoneNumber) => {
    if (editingProfile?.profileId === profile.profileId) {
      setEditingProfile(null);
      setEditedProfile(null);
    } else {
      setEditingProfile({ profileId: profile.profileId, phoneNumber });
      setEditedProfile({ ...profile, paymentType: profile.advance?.paymentType || "Cash" });
    }
    setDropdownOpen(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      console.log("updateCustomerProfile request:", {
        name: editedProfile.name,
        advance: { ...editedProfile.advance, paymentType: editedProfile.paymentType },
      });
      await apiService.updateCustomerProfile(shopApiName, editingProfile.phoneNumber, editedProfile.profileId, {
        name: editedProfile.name,
        advance: { ...editedProfile.advance, paymentType: editedProfile.paymentType },
      });
      await loadCustomers();
      setEditingProfile(null);
      setEditedProfile(null);
      setError(null);
    } catch (err) {
      console.error("Error saving edit:", err);
      setError(`Failed to save profile: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profile, phoneNumber) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      setLoading(true);
      try {
        await apiService.softDeleteCustomerProfile(shopApiName, phoneNumber, profile.profileId);
        await loadCustomers();
        setError(null);
      } catch (err) {
        console.error("Error deleting profile:", err);
        setError(`Failed to delete profile: ${err.message}`);
        alert(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  // Modified filtering logic to be less restrictive
  const filteredCustomers = (customers || []).filter(
    (c) => {
      // First check if customer has a name or phone number that matches the search
      const nameOrPhoneMatches = (getCommonName(c.profiles).toLowerCase().includes(searchTerm) || 
                                 (c.phoneNumber || "").includes(searchTerm));
      
      // Then check if any profile has advance.value=true (relaxed the showinadvance condition)
      const hasAdvanceProfiles = (c.profiles || []).some(p => p.advance?.value);
      
      return nameOrPhoneMatches && hasAdvanceProfiles;
    }
  );

  const handleShowBills = (bills, profileName, phoneNumber) => {
    setSelectedBills({ bills: bills || [], profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleShowHistory = (history, profileName, phoneNumber) => {
    console.log("Showing history for profile:", profileName, history);
    setSelectedHistory({ history: history || [], profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleCloseModal = () => {
    setSelectedBills(null);
    setSelectedHistory(null);
  };

  const handlePrintBill = (bill, profileName, phoneNumber) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill ${bill.billNo || "N/A"}</title>
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
          <h2>Bill No: ${bill.billNo || "N/A"}</h2>
          <p>Profile Name: ${profileName || "N/A"}</p>
          <p>Phone Number: ${phoneNumber || "N/A"}</p>
          <p>Date: ${bill.date ? new Date(bill.date).toLocaleDateString() : "N/A"}</p>
          <p class="payment-type">Payment Type: ${bill.paymentType || "N/A"}</p>
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
              ${(bill.items || []).map((item) => `
                <tr>
                  <td>${item.product || "N/A"}</td>
                  <td>${item.qty || 0}</td>
                  <td>₹${item.pricePerQty || 0}</td>
                  <td>₹${item.amount || 0}</td>
                </tr>
              `).join("")}
              <tr class="total">
                <td colspan="3">Total Amount</td>
                <td>₹${bill.totalAmount || 0}</td>
              </tr>
              ${bill.advanceRemaining !== undefined ? `
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

  const toggleDropdown = (profileId) => {
    setDropdownOpen(dropdownOpen === profileId ? null : profileId);
  };

  const filteredCustomerOptions = (customers || []).filter(
    (c) =>
      getCommonName(c.profiles).toLowerCase().includes(newPayment.customerName.toLowerCase()) &&
      (c.profiles || []).some((p) => p.advance?.value)
  );

  // Add debug message for customers data
  console.log("Total customers:", customers.length);
  console.log("Filtered customers:", filteredCustomers.length);

  return (
    <div className="main-content">
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      <div className="advance-payment-form-container">
        <div className="form-group shop-selector">
          <label>Shop</label>
          <select
            value={shop}
            onChange={(e) => {
              setShop(e.target.value);
              setNewPayment({
                date: new Date().toISOString().split("T")[0],
                customerName: "",
                phoneNumber: "",
                profileId: "",
                advanceAmount: "",
                newProfileName: "",
                paymentType: "Cash",
              });
              setSearchTerm("");
              setSelectedBills(null);
              setSelectedHistory(null);
              setIsExistingCustomer(false);
              setEditingProfile(null);
              setEditedProfile(null);
            }}
          >
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <h2 className="form-title">Add New Advance Payment - {shop}</h2>
        <div className="advance-payment-form">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={newPayment.date} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <span>Customer</span>
              <span className="checkbox-container">
                <input type="checkbox" checked={isExistingCustomer} onChange={handleCheckboxChange} />
                Existing Customer
              </span>
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
                {filteredCustomerOptions.map((c) => (
                  <option key={c.phoneNumber} value={`${getCommonName(c.profiles)} (${c.phoneNumber})`} />
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
            <select name="profileId" value={newPayment.profileId} onChange={handleInputChange} disabled={!newPayment.phoneNumber}>
              <option value="">Select profile</option>
              <option value={`new-profile-${newPayment.phoneNumber}`}>New Profile</option>
              {(customers.find((c) => c.phoneNumber === newPayment.phoneNumber)?.profiles || [])
                .filter((p) => p.advance?.value)
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
              placeholder="Enter amount (negative for refund)"
              value={newPayment.advanceAmount}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Payment Type</label>
            <select name="paymentType" value={newPayment.paymentType} onChange={handleInputChange}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div className="form-buttons">
            <button className="add-btn" onClick={handleAddPayment} disabled={loading}>
              Add Advance Payment
            </button>
          </div>
        </div>
      </div>

      <div className="advance-payment-list-container">
        <h2 className="list-title">Advance Payment Balances - {shop}</h2>
        <div className="advance-payment-filter">
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        {filteredCustomers.length === 0 && !loading && (
          <div className="no-data">No advance payment customers found.</div>
        )}
        
        <table className="advance-payment-table">
          <thead>
            <tr>
              <th>Contractor</th>
              <th>Profile</th>
              <th>Payment Type</th>
              <th>Advance Given</th>
              <th>Advance Used</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <React.Fragment key={c.phoneNumber || Math.random()}>
                <tr>
                  <td colSpan={7}>
                    <h3 className="contractor-heading">
                      {getCommonName(c.profiles)} (
                      {(c.profiles || []).filter((p) => p.advance?.value).length} profiles)
                    </h3>
                  </td>
                </tr>
                {(c.profiles || [])
                  .filter((p) => p.advance?.value)
                  .map((p) => {
                    const totalDeposits = (p.advanceHistory || [])
                      .filter((h) => h.transactionType === "Deposit")
                      .reduce((sum, h) => sum + (h.amount || 0), 0);
                    const totalRefunds = (p.advanceHistory || [])
                      .filter((h) => h.transactionType === "Refund")
                      .reduce((sum, h) => sum + (h.amount || 0), 0);
                    const totalUsed = (p.bills || []).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                    const currentBalance = p.advance?.currentamount || 0;
                    const paymentType = p.advance?.paymentType || p.paymentType || "N/A";
                    console.log(`Profile ${p.name} advanceHistory:`, p.advanceHistory);
                    return (
                      <tr key={p.profileId || Math.random()}>
                        <td>{getCommonName(c.profiles)}</td>
                        <td>
                          {editingProfile?.profileId === p.profileId ? (
                            <input
                              type="text"
                              name="name"
                              value={editedProfile.name || ""}
                              onChange={handleEditChange}
                              className="inline-edit-input"
                            />
                          ) : (
                            p.name || "N/A"
                          )}
                        </td>
                        <td>
                          {editingProfile?.profileId === p.profileId ? (
                            <select
                              name="paymentType"
                              value={editedProfile.paymentType}
                              onChange={handleEditChange}
                              className="inline-edit-select"
                            >
                              <option value="Cash">Cash</option>
                              <option value="Card">Card</option>
                              <option value="Online">Online</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          ) : (
                            paymentType
                          )}
                        </td>
                        <td>₹{totalDeposits.toFixed(2)}</td>
                        <td>₹{totalUsed.toFixed(2)}</td>
                        <td>₹{currentBalance.toFixed(2)}</td>
                        <td>
                          <div className="dropdown">
                            <button className="dropdown-btn" onClick={() => toggleDropdown(p.profileId)}>
                              <MoreVertical size={16} />
                            </button>
                            {dropdownOpen === p.profileId && (
                              <div className="dropdown-menu">
                                <button
                                  className="dropdown-item show-bills-btn"
                                  onClick={() => handleShowBills(p.bills, p.name, c.phoneNumber)}
                                  disabled={!(p.bills && p.bills.length > 0)}
                                >
                                  <Receipt size={16} /> Bills
                                </button>
                                <button
                                  className="dropdown-item show-history-btn"
                                  onClick={() => handleShowHistory(p.advanceHistory, p.name, c.phoneNumber)}
                                >
                                  <History size={16} /> History
                                </button>
                                <button
                                  className="dropdown-item edit-btn"
                                  onClick={() =>
                                    editingProfile?.profileId === p.profileId ? handleSaveEdit() : handleEditStart(p, c.phoneNumber)
                                  }
                                >
                                  {editingProfile?.profileId === p.profileId ? <Save size={16} /> : <Pencil size={16} />}
                                  {editingProfile?.profileId === p.profileId ? "Save" : "Edit"}
                                </button>
                                <button
                                  className="dropdown-item delete-btn"
                                  onClick={() => handleDeleteProfile(p, c.phoneNumber)}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {(selectedBills || selectedHistory) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseModal}>Close</button>
            <h2>
              {(selectedBills ? "Bill Details" : "Advance History") + " for " + (selectedBills?.profileName || selectedHistory?.profileName || "N/A")}
            </h2>
            <p>Phone Number: {selectedBills?.phoneNumber || selectedHistory?.phoneNumber || "N/A"}</p>
            {selectedBills ? (
              (selectedBills.bills || []).length === 0 ? (
                <p className="no-data">No bills available.</p>
              ) : (
                (selectedBills.bills || []).map((bill) => (
                  <div key={bill.billNo || Math.random()} className="bill-details">
                    <h3>Bill No: {bill.billNo || "N/A"}</h3>
                    <p>Date: {bill.date ? new Date(bill.date).toLocaleDateString() : "N/A"}</p>
                    <p>Payment Type: {bill.paymentType || "N/A"}</p>
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
                        {(bill.items || []).map((item, i) => (
                          <tr key={i}>
                            <td>{item.product || "N/A"}</td>
                            <td>{item.qty || 0}</td>
                            <td>₹{item.pricePerQty || 0}</td>
                            <td>₹{item.amount || 0}</td>
                          </tr>
                        ))}
                        <tr className="total">
                          <td colSpan={3}>Total Amount</td>
                          <td>₹{bill.totalAmount || 0}</td>
                        </tr>
                        {bill.advanceRemaining !== undefined && (
                          <tr className="total">
                            <td colSpan={3}>Advance Remaining</td>
                            <td>₹{bill.advanceRemaining}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <button
                      className="print-btn"
                      onClick={() => handlePrintBill(bill, selectedBills.profileName, selectedBills.phoneNumber)}
                    >
                      Print Bill
                    </button>
                  </div>
                ))
              )
            ) : (selectedHistory.history || []).length === 0 ? (
              <p className="no-data">No advance history available.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedHistory.history || []).map((h, i) => (
                    <tr key={i}>
                      <td>{h.date ? new Date(h.date).toLocaleDateString() : "N/A"}</td>
                      <td>{h.transactionType || "N/A"}</td>
                      <td>₹{h.amount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePayments;