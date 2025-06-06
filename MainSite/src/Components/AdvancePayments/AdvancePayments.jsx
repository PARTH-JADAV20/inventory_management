import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from '../ShopContext/ShopContext';
import { Pencil, Save, Trash2, MoreVertical, Receipt, History } from "lucide-react";
import * as apiService from "../api";
import "./AdvancePayments.css";

const AdvancePayments = () => {

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "N/A";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "N/A";
    }
  };

  const getCurrentISTDate = () => {
    const now = new Date();
    const istOffsetMinutes = 5.5 * 60; // 5 hours 30 minutes
    const istDate = new Date(now.getTime() + (istOffsetMinutes * 60 * 1000));
    return istDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };
  const [customers, setCustomers] = useState([]);
  const { shop, setShop } = useContext(ShopContext)
  const [newPayment, setNewPayment] = useState({
    date: formatDateToDDMMYYYY(getCurrentISTDate()),
    customerName: "",
    phoneNumber: "",
    profileId: "",
    advanceAmount: "",
    newProfileName: "",
    paymentMethod: "Cash",
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


  const getCommonName = (profiles) => {
    const names = (profiles || []).map((p) => (p.name || "Unknown").replace(/ \[.*\]$/, ""));
    return names[0] || "Unknown";
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Fetch all customers without pagination
      const data = await apiService.fetchCustomers(shop, searchTerm, false, 1, 100000);
      // Filter customers with advance profiles
      const advanceCustomers = (data.customers || []).filter(c =>
        (c.profiles || []).some(p => p.advance?.value === true && p.advance?.showinadvance === true)
      );
      setCustomers(advanceCustomers);
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
        const customer = await apiService.fetchCustomerByPhone(shop, value);
        setNewPayment({
          ...newPayment,
          phoneNumber: value,
          customerName: customer ? getCommonName(customer.profiles) : "",
          profileId: "",
          newProfileName: "",
          paymentMethod: "Cash",
        });
      } catch (err) {
        console.error("Error fetching customer by phone:", err);
        setNewPayment({ ...newPayment, phoneNumber: value, customerName: "", profileId: "", newProfileName: "", paymentMethod: "Cash" });
      }
    } else if (name === "profileId") {
      const customer = customers.find((c) => c.phoneNumber === newPayment.phoneNumber);
      const profile = customer?.profiles.find((p) => p.profileId === value);
      setNewPayment({
        ...newPayment,
        profileId: value,
        paymentMethod: profile?.advance?.paymentMethod || "Cash",
      });
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
      paymentMethod: "Cash",
    });
  };

  const handleAddPayment = async () => {
    if (
      !newPayment.date ||
      !newPayment.customerName ||
      !newPayment.phoneNumber ||
      (!newPayment.profileId && !isExistingCustomer) ||
      !newPayment.advanceAmount ||
      !newPayment.paymentMethod
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
      let existingCustomer = null;
      try {
        existingCustomer = await apiService.fetchCustomerByPhone(shop, newPayment.phoneNumber);
      } catch (err) {
        if (err.message !== "Customer not found") {
          throw err;
        }
      }

      if (!isExistingCustomer && existingCustomer) {
        alert("Phone number exists. Use Existing Customer option.");
        return;
      }

      if (existingCustomer && newPayment.profileId.startsWith("new-profile")) {
        if (existingCustomer.profiles.some((p) => p.name === newPayment.newProfileName)) {
          alert("Profile name already exists for this customer");
          return;
        }
        const profileData = {
          name: newPayment.newProfileName,
          advance: { value: true, currentamount: advanceAmount, showinadvance: true, paymentMethod: newPayment.paymentMethod },
          paymentMethod: "",
          credit: 0,
          advanceHistory: [
            {
              transactionType: "Deposit",
              amount: advanceAmount,
              date: newPayment.date,
            },
          ],
          bills: [],
          deleteuser: { value: false, date: "" },
        };
        await apiService.appendCustomerProfile(shop, newPayment.phoneNumber, profileData);
      } else if (existingCustomer && !newPayment.profileId.startsWith("new-profile")) {
        const profile = existingCustomer.profiles.find((p) => p.profileId === newPayment.profileId);
        if (!profile) {
          alert("Selected profile not found");
          return;
        }
        if (advanceAmount < 0 && (profile.advance?.currentamount || 0) < Math.abs(advanceAmount)) {
          alert("Refund amount cannot exceed the current advance balance.");
          return;
        }
        await apiService.addAdvancePayment(shop, newPayment.phoneNumber, newPayment.profileId, {
          date: newPayment.date,
          amount: advanceAmount,
          paymentMethod: newPayment.paymentMethod,
        });
      } else {
        if (advanceAmount < 0) {
          alert("Cannot create a new customer with a refund. Please add a deposit first.");
          return;
        }
        const profileData = {
          name: newPayment.profileId.startsWith("new-profile") ? newPayment.newProfileName : newPayment.customerName,
          advance: { value: true, currentamount: advanceAmount, showinadvance: true, paymentMethod: newPayment.paymentMethod },
          paymentMethod: "",
          credit: 0,
          advanceHistory: [
            {
              transactionType: "Deposit",
              amount: advanceAmount,
              date: formatDateToDDMMYYYY(newPayment.date),
            },
          ],
          bills: [],
          deleteuser: { value: false, date: "" },
        };
        const customerData = {
          phoneNumber: newPayment.phoneNumber,
          profiles: [profileData],
        };
        await apiService.createCustomer(shop, customerData);
      }

      await loadCustomers();
      setNewPayment({
        date: getCurrentISTDate(),
        customerName: "",
        phoneNumber: "",
        profileId: "",
        advanceAmount: "",
        newProfileName: "",
        paymentMethod: "Cash",
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

  useEffect(() => {
    setNewPayment({
      date: getCurrentISTDate(),
      customerName: "",
      phoneNumber: "",
      profileId: "",
      advanceAmount: "",
      newProfileName: "",
      paymentMethod: "Cash",
    });
    setSearchTerm("");
    setSelectedBills(null);
    setSelectedHistory(null);
    setIsExistingCustomer(false);
    setEditingProfile(null);
    setEditedProfile(null);
    loadCustomers();
  }, [shop]);

  const handleEditStart = (profile, phoneNumber) => {
    if (editingProfile?.profileId === profile.profileId) {
      setEditingProfile(null);
      setEditedProfile(null);
    } else {
      setEditingProfile({ profileId: profile.profileId, phoneNumber });
      setEditedProfile({
        ...profile,
        name: profile.name,
        advance: { ...profile.advance, paymentMethod: profile.advance?.paymentMethod || "Cash" },
      });
    }
    setDropdownOpen(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "paymentMethod") {
      setEditedProfile({
        ...editedProfile,
        advance: { ...editedProfile.advance, paymentMethod: value },
      });
    } else {
      setEditedProfile({ ...editedProfile, [name]: value });
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await apiService.updateAdvanceProfile(shop, editingProfile.phoneNumber, editedProfile.profileId, {
        name: editedProfile.name,
        paymentMethod: editedProfile.advance.paymentMethod,
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
    if (window.confirm("Are you sure you want to hide this profile from advance payments?")) {
      setLoading(true);
      try {
        await apiService.deleteAdvanceProfile(shop, phoneNumber, profile.profileId);
        await loadCustomers();
        setError(null);
      } catch (err) {
        console.error("Error hiding profile:", err);
        setError(`Failed to hide profile: ${err.message}`);
        alert(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(1); // Reset page on search
  };

  const filteredCustomers = (customers || []).filter(
    (c) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (getCommonName(c.profiles).toLowerCase().includes(searchTermLower) ||
          (c.phoneNumber || "").includes(searchTermLower)) &&
        (c.profiles || []).some(p => p.advance?.value === true && p.advance?.showinadvance === true)
      );
    }
  );

  const handleShowBills = (bills, profileName, phoneNumber) => {
    setSelectedBills({ bills: bills || [], profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleShowHistory = (history, profileName, phoneNumber) => {
    setSelectedHistory({ history: history || [], profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleCloseModal = () => {
    setSelectedBills(null);
    setSelectedHistory(null);
  };

  const handlePrintBill = (bill, profileName, phoneNumber) => {
    const customer = customers.find((c) => c.phoneNumber === phoneNumber);
    const profile = customer && Array.isArray(customer.profiles)
      ? customer.profiles.find((p) => p.name === profileName)
      : null;
    const returns = profile?.returns?.filter((r) => r.billNo === bill.billNo) || [];
    console.log(bill)

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
          .payment-type, .note { margin-top: 10px; font-style: italic; }
        </style>
      </head>
      <body>
        <h2>Bill No: ${bill.billNo}</h2>
        <p>Profile Name: ${profileName}</p>
        <p>Phone Number: ${phoneNumber}</p>
        <p>Date: ${bill.date || "N/A"}</p>
        <p class="payment-type">Payment Method: ${bill.paymentMethod ?? "N/A"}</p>
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
            ${Array.isArray(bill.items) ? bill.items.map(item => `
              <tr>
                <td>${item.product || 'N/A'}</td>
                <td>${item.qty || 0}</td>
                <td>₹${parseFloat(item.pricePerQty || 0).toFixed(2)}</td>
                <td>₹${parseFloat(item.amount || 0).toFixed(2)}</td>
              </tr>
            `).join("") : ""}
            <tr class="total">
              <td colspan="3">Other Expenses</td>
              <td>₹${parseFloat(bill.otherExpenses || 0).toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Total Amount</td>
              <td>₹${parseFloat(bill.totalAmount || 0).toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Profit</td>
              <td>₹${parseFloat(bill.profit || 0).toFixed(2)}</td>
            </tr>
            ${profile?.advance?.value && bill.advanceRemaining !== undefined ? `
              <tr class="total">
                <td colspan="3">Advance Remaining</td>
                <td>₹${parseFloat(bill.advanceRemaining).toFixed(2)}</td>
              </tr>
            ` : ""}
            ${bill.note ? `
              <tr class="total">
                <td colspan="1">Note</td>
                <td colspan="3" style="font-size: 14px;">${bill.note}</td>
              </tr>` : ""}
          </tbody>
        </table>
  `;

    if (returns.length > 0) {
      billContent += `
      <h3>Returned Items</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Return Amount</th>
          </tr>
        </thead>
        <tbody>
          ${returns.flatMap((r) =>
        r.items.map((item) => `
              <tr>
                <td>${item.product}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>₹${r.returnAmount.toFixed(2)}</td>
              </tr>
            `)
      ).join("")}
          <tr class="total">
            <td colspan="3">Total Return</td>
            <td>₹${returns.reduce((sum, r) => sum + r.returnAmount, 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    `;
    }

    billContent += `
      </body>
    </html>
  `;

    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
  };


  const toggleDropdown = (profileId) => {
    setDropdownOpen(dropdownOpen === profileId ? null : profileId);
  };

  const filteredCustomerOptions = (customers || []).filter(
    (c) =>
      getCommonName(c.profiles).toLowerCase().includes(newPayment.customerName.toLowerCase()) &&
      (c.profiles || []).some((p) => p.advance?.value && p.advance?.showinadvance)
  );

  return (
    <div className="main-content">
      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error">{error}</div>}
      <div className="advance-payment-form-container">
        <h2 className="form-title">Add New Advance Payment - {shop}</h2>
        <div className="advance-payment-form">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={newPayment.date} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <span>Customer</span>
              <span className="checkbox-container-p">
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
                .filter((p) => p.advance?.value && p.advance?.showinadvance)
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
            <select name="paymentMethod" value={newPayment.paymentMethod} onChange={handleInputChange}>
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
          <div className="summary-stats">
            <p>Advance Customers: {filteredCustomers.length}</p>
          </div>
        </div>

        {filteredCustomers.length === 0 && !loading && (
          <div className="no-data">No advance payment customers found.</div>
        )}

        <table className="advance-payment-table">
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Contractor</th>
              <th>Profile</th>
              <th>Payment Method</th>
              <th>Advance Given</th>
              <th>Advance Used</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c, index) => (
              <React.Fragment key={c.phoneNumber || Math.random()}>
                <tr>
                  <td style={{ fontWeight: "bolder", color: "#ff6b2c" }}>{index + 1}</td>
                  <td colspan={7}>
                    <h3 className="contractor-heading">
                      {getCommonName(c.profiles)} (
                      {(c.profiles || []).filter((p) => p.advance?.value && p.advance?.showinadvance).length} profiles)
                    </h3>
                  </td>
                </tr>
                {(c.profiles || [])
                  .filter((p) => p.advance?.value && p.advance?.showinadvance)
                  .map((p) => {
                    const totalDeposits = (p.advanceHistory || [])
                      .filter((h) => h.transactionType === "Deposit")
                      .reduce((sum, h) => sum + (h.amount || 0), 0);
                    const totalRefunds = (p.advanceHistory || [])
                      .filter((h) => h.transactionType === "Refund")
                      .reduce((sum, h) => sum + (h.amount || 0), 0);
                    const totalUsed = (p.bills || []).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                    const currentBalance = p.advance?.currentamount || 0;
                    const paymentMethod = p.advance?.paymentMethod || "N/A";
                    return (
                      <tr key={p.profileId || Math.random()}>
                        <td></td>
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
                              name="paymentMethod"
                              value={editedProfile.advance?.paymentMethod || "Cash"}
                              onChange={handleEditChange}
                              className="inline-edit-select"
                            >
                              <option value="Cash">Cash</option>
                              <option value="Card">Card</option>
                              <option value="Online">Online</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          ) : (
                            paymentMethod
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
                                  <Trash2 size={16} /> Hide
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
                    <p>Date: {bill.date}</p>
                    <p>Payment Method: {bill.paymentMethod || "N/A"}</p>
                    <table className="bill-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit</th>
                          <th>Price/Qty</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bill.items || []).map((item, i) => (
                          <tr key={i}>
                            <td>{item.product || "N/A"}</td>
                            <td>{item.qty || 0}</td>
                            <td>{item.unit || "N/A"}</td>
                            <td>₹{item.pricePerQty || 0}</td>
                            <td>₹{item.amount || 0}</td>
                          </tr>
                        ))}
                        <tr className="total">
                          <td colspan={4}>Other Expenses</td>
                          <td>₹{bill.otherExpenses}</td>
                        </tr>
                        <tr className="total">
                          <td colspan={4}>Total Amount</td>
                          <td>₹{bill.totalAmount || 0}</td>
                        </tr>
                        <tr className="total">
                          <td colspan={4}>Profit</td>
                          <td>₹{bill.profit || 0}</td>
                        </tr>
                        {bill.advanceRemaining !== undefined && (
                          <tr className="total">
                            <td colspan={4}>Advance Remaining</td>
                            <td>₹{bill.advanceRemaining}</td>
                          </tr>
                        )}
                        {bill.note && (
                          <tr className="note">
                            <td colspan={5} style={{ fontSize: "14px" }}>
                              Note: {bill.note}
                            </td>
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
                      <td>{h.date}</td>
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