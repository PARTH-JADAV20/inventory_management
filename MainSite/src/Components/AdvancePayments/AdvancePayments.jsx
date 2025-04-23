import React, { useState } from "react";
import { Pencil, Save, Trash2, MoreVertical, Receipt, History } from "lucide-react";
import { customersData, customersData2 } from "../customers.js";
import "./AdvancePayments.css";

const AdvancePayments = () => {
  const [customers, setCustomers] = useState(customersData);
  const [customers2, setCustomers2] = useState(customersData2);
  const [shop, setShop] = useState("Shop 1");
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split("T")[0],
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

  const getCommonName = (profiles) => profiles.map(p => p.name.replace(/ \[.*\]$/, ""))[0] || "Unknown";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const activeCustomers = shop === "Shop 1" ? customers : customers2;
    if (name === "customerName" && isExistingCustomer) {
      const match = value.match(/^(.+)\s*\((\d+)\)$/);
      if (match) {
        const [, commonName, phoneNumber] = match;
        setNewPayment({ ...newPayment, customerName: commonName, phoneNumber, profileId: "", newProfileName: "" });
      } else {
        setNewPayment({ ...newPayment, customerName: value, phoneNumber: "", profileId: "", newProfileName: "" });
      }
    } else if (name === "phoneNumber" && isExistingCustomer) {
      const customer = activeCustomers.find(c => c.phoneNumber === value);
      setNewPayment({ ...newPayment, phoneNumber: value, customerName: customer ? getCommonName(customer.profiles) : "", profileId: "", newProfileName: "" });
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    setIsExistingCustomer(e.target.checked);
    setNewPayment({ date: new Date().toISOString().split("T")[0], customerName: "", phoneNumber: "", profileId: "", advanceAmount: "", newProfileName: "", paymentMethod: "Cash" });
  };

  const handleAddPayment = () => {
    if (!newPayment.date || !newPayment.customerName || !newPayment.phoneNumber || !newPayment.profileId || !newPayment.advanceAmount || !newPayment.paymentMethod) {
      alert("Please fill all required fields");
      return;
    }

    if (newPayment.profileId.startsWith("new-profile") && !newPayment.newProfileName) {
      alert("Please enter a profile name");
      return;
    }

    const advanceAmount = parseFloat(newPayment.advanceAmount);
    const transactionType = advanceAmount < 0 ? "Refund" : "Deposit";
    const absoluteAmount = Math.abs(advanceAmount);

    const activeCustomers = shop === "Shop 1" ? customers : customers2;
    const setActiveCustomers = shop === "Shop 1" ? setCustomers : setCustomers2;
    const existingCustomer = activeCustomers.find(c => c.phoneNumber === newPayment.phoneNumber);

    if (!isExistingCustomer && existingCustomer) {
      alert("Phone number exists. Use Existing Customer option.");
      return;
    }

    if (existingCustomer && newPayment.profileId.startsWith("new-profile")) {
      if (existingCustomer.profiles.some(p => p.name.toLowerCase() === newPayment.newProfileName.toLowerCase())) {
        alert("Profile name already exists");
        return;
      }
    }

    const updateCustomers = (customers, setCustomers) => {
      return customers.map(c =>
        c.phoneNumber === newPayment.phoneNumber
          ? {
              ...c,
              profiles: newPayment.profileId.startsWith("new-profile")
                ? [...c.profiles, {
                    profileId: `profile-${Date.now()}`,
                    name: newPayment.newProfileName,
                    advance: { value: true, currentamount: absoluteAmount, showinadvance: true, paymentMethod: newPayment.paymentMethod },
                    advanceHistory: [{ transactionType, amount: absoluteAmount, date: newPayment.date }],
                    bills: [],
                    deleteuser: { value: false, date: "" },
                  }]
                : c.profiles.map(p =>
                    p.profileId === newPayment.profileId
                      ? {
                          ...p,
                          advance: { ...p.advance, currentamount: p.advance.currentamount + advanceAmount, paymentMethod: newPayment.paymentMethod },
                          advanceHistory: [...p.advanceHistory, { transactionType, amount: absoluteAmount, date: newPayment.date }],
                        }
                      : p
                  ),
            }
          : c
      );
    };

    if (existingCustomer) {
      const updatedCustomer = activeCustomers.find(c => c.phoneNumber === newPayment.phoneNumber);
      const profile = updatedCustomer.profiles.find(p => p.profileId === newPayment.profileId);
      if (profile && profile.advance.currentamount + advanceAmount < 0) {
        alert("Refund amount cannot exceed the current advance balance.");
        return;
      }
      setActiveCustomers(updateCustomers(activeCustomers, setActiveCustomers));
    } else {
      setActiveCustomers([...activeCustomers, {
        phoneNumber: newPayment.phoneNumber,
        profiles: [{
          profileId: `profile-${Date.now()}`,
          name: newPayment.customerName,
          advance: { value: true, currentamount: absoluteAmount, showinadvance: true, paymentMethod: newPayment.paymentMethod },
          advanceHistory: [{ transactionType, amount: absoluteAmount, date: newPayment.date }],
          bills: [],
          deleteuser: { value: false, date: "" },
        }],
      }]);
      setNewPayment({ ...newPayment, profileId: `profile-${Date.now()}` });
    }

    setNewPayment({ date: new Date().toISOString().split("T")[0], customerName: "", phoneNumber: "", profileId: "", advanceAmount: "", newProfileName: "", paymentMethod: "Cash" });
    setIsExistingCustomer(false);
  };

  const handleEditStart = (profile, phoneNumber, shop) => {
    if (editingProfile?.profileId === profile.profileId) {
      setEditingProfile(null);
      setEditedProfile(null);
    } else {
      setEditingProfile({ profileId: profile.profileId, phoneNumber, shop });
      setEditedProfile({ ...profile, paymentMethod: profile.advance.paymentMethod || "Cash" });
    }
    setDropdownOpen(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleSaveEdit = () => {
    const setActiveCustomers = editingProfile.shop === "Shop 1" ? setCustomers : setCustomers2;
    const activeCustomers = editingProfile.shop === "Shop 1" ? customers : customers2;
    setActiveCustomers(
      activeCustomers.map(c =>
        c.phoneNumber === editingProfile.phoneNumber
          ? {
              ...c,
              profiles: c.profiles.map(p =>
                p.profileId === editedProfile.profileId
                  ? {
                      ...p,
                      name: editedProfile.name,
                      advance: { ...p.advance, paymentMethod: editedProfile.paymentMethod },
                    }
                  : p
              ),
            }
          : c
      )
    );
    setEditingProfile(null);
    setEditedProfile(null);
  };

  const handleDeleteProfile = (profile, phoneNumber) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      const setActiveCustomers = shop === "Shop 1" ? setCustomers : setCustomers2;
      const activeCustomers = shop === "Shop 1" ? customers : customers2;
      setActiveCustomers(
        activeCustomers.map(c =>
          c.phoneNumber === phoneNumber
            ? {
                ...c,
                profiles: c.profiles.map(p =>
                  p.profileId === profile.profileId
                    ? { ...p, advance: { ...p.advance, showinadvance: false } }
                    : p
                ),
              }
            : c
        )
      );
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const filteredCustomers = (shop === "Shop 1" ? customers : customers2).filter(c =>
    (getCommonName(c.profiles).toLowerCase().includes(searchTerm) || c.phoneNumber.includes(searchTerm)) &&
    c.profiles.some(p => p.advance.value && p.advance.showinadvance)
  );

  const handleShowBills = (bills, profileName, phoneNumber) => {
    setSelectedBills({ bills, profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleShowHistory = (history, profileName, phoneNumber) => {
    setSelectedHistory({ history, profileName, phoneNumber });
    setDropdownOpen(null);
  };

  const handleCloseModal = () => {
    setSelectedBills(null);
    setSelectedHistory(null);
  };

  const handlePrintBill = (bill, profileName, phoneNumber) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Bill ${bill.billNo}</title>
      <style>body{font-family:'Segoe UI',sans-serif;padding:20px;}
      h2{color:#ff6b35;}table{width:100%;border-collapse:collapse;margin-top:20px;}
      th,td{border:1px solid #3a3a5a;padding:10px;text-align:left;}
      th{background-color:#2b2b40;color:#a1a5b7;}td{background-color:#1e1e2d;color:#ffffff;}
      .total{font-weight:bold;}.payment-method{margin-top:10px;font-style:italic;}</style></head>
      <body><h2>Bill No: ${bill.billNo}</h2><p>Profile Name: ${profileName}</p><p>Phone Number: ${phoneNumber}</p>
      <p>Date: ${bill.date}</p><p class="payment-method">Payment Method: ${bill.paymentMethod}</p>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price/Qty</th><th>Amount</th></tr></thead><tbody>
      ${bill.items.map(item => `<tr><td>${item.product}</td><td>${item.qty}</td><td>₹${item.pricePerQty}</td><td>₹${item.amount}</td></tr>`).join("")}
      <tr class="total"><td colspan="3">Total Amount</td><td>₹${bill.totalAmount}</td></tr>
      ${bill.advanceRemaining !== undefined ? `<tr class="total"><td colspan="3">Advance Remaining</td><td>₹${bill.advanceRemaining}</td></tr>` : ""}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleDropdown = (profileId) => {
    setDropdownOpen(dropdownOpen === profileId ? null : profileId);
  };

  const filteredCustomerOptions = (shop === "Shop 1" ? customers : customers2).filter(c =>
    getCommonName(c.profiles).toLowerCase().includes(newPayment.customerName.toLowerCase()) &&
    c.profiles.some(p => p.advance.value && p.advance.showinadvance)
  );

  return (
    <div className="main-content">
      <div className="advance-payment-form-container">
        <div className="form-group shop-selector">
          <label>Shop</label>
          <select value={shop} onChange={(e) => { setShop(e.target.value); setNewPayment({ date: new Date().toISOString().split("T")[0], customerName: "", phoneNumber: "", profileId: "", advanceAmount: "", newProfileName: "", paymentMethod: "Cash" }); setSearchTerm(""); setSelectedBills(null); setSelectedHistory(null); setIsExistingCustomer(false); setEditingProfile(null); setEditedProfile(null); }}>
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
            <input type="text" name="customerName" placeholder={isExistingCustomer ? "Type customer name" : "Enter customer name"} value={newPayment.customerName} onChange={handleInputChange} list={isExistingCustomer ? "customerList" : undefined} />
            {isExistingCustomer && <datalist id="customerList">{filteredCustomerOptions.map(c => <option key={c.phoneNumber} value={`${getCommonName(c.profiles)} (${c.phoneNumber})`} />)}</datalist>}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phoneNumber" placeholder={isExistingCustomer ? "Type phone number" : "Enter phone number"} value={newPayment.phoneNumber} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Profile</label>
            <select name="profileId" value={newPayment.profileId} onChange={handleInputChange} disabled={!newPayment.phoneNumber}>
              <option value="">Select profile</option>
              <option value={`new-profile-${newPayment.phoneNumber}`}>New Profile</option>
              {(shop === "Shop 1" ? customers : customers2).find(c => c.phoneNumber === newPayment.phoneNumber)?.profiles.filter(p => p.advance.value && p.advance.showinadvance).map(p => <option key={p.profileId} value={p.profileId}>{p.name}</option>)}
            </select>
          </div>
          {newPayment.profileId.startsWith("new-profile") && <div className="form-group"><label>Profile Name</label><input type="text" name="newProfileName" placeholder="Enter profile name" value={newPayment.newProfileName} onChange={handleInputChange} /></div>}
          <div className="form-group">
            <label>Advance Amount</label>
            <input type="number" name="advanceAmount" placeholder="Enter amount" value={newPayment.advanceAmount} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod" value={newPayment.paymentMethod} onChange={handleInputChange}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div className="form-buttons">
            <button className="add-btn" onClick={handleAddPayment}>Add Advance Payment</button>
          </div>
        </div>
      </div>

      <div className="advance-payment-list-container">
        <h2 className="list-title">Advance Payment Balances - {shop}</h2>
        <div className="advance-payment-filter">
          <input type="text" placeholder="Search by name or phone" value={searchTerm} onChange={handleSearch} className="search-input" />
        </div>
        <table className="advance-payment-table">
          <thead>
            <tr>
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
            {filteredCustomers.map(c => (
              <React.Fragment key={c.phoneNumber}>
                <tr><td colSpan={7}><h3 className="contractor-heading">{getCommonName(c.profiles)} ({c.profiles.filter(p => p.advance.value && p.advance.showinadvance).length} profiles)</h3></td></tr>
                {c.profiles.filter(p => p.advance.value && p.advance.showinadvance).map(p => {
                  const totalDeposits = p.advanceHistory.filter(h => h.transactionType === "Deposit").reduce((sum, h) => sum + h.amount, 0);
                  const totalUsed = p.bills.reduce((sum, b) => sum + b.totalAmount, 0);
                  const currentBalance = p.advance.currentamount;
                  const paymentMethod = p.advance.paymentMethod || "N/A";
                  return (
                    <tr key={p.profileId}>
                      <td>{getCommonName(c.profiles)}</td>
                      <td>
                        {editingProfile?.profileId === p.profileId ? (
                          <input type="text" name="name" value={editedProfile.name} onChange={handleEditChange} className="inline-edit-input" />
                        ) : (
                          p.name
                        )}
                      </td>
                      <td>
                        {editingProfile?.profileId === p.profileId ? (
                          <select name="paymentMethod" value={editedProfile.paymentMethod} onChange={handleEditChange} className="inline-edit-select">
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Online">Online</option>
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
                              <button className="dropdown-item show-bills-btn" onClick={() => handleShowBills(p.bills, p.name, c.phoneNumber)} disabled={p.bills.length === 0}>
                                <Receipt size={16} /> Bills
                              </button>
                              <button className="dropdown-item show-history-btn" onClick={() => handleShowHistory(p.advanceHistory, p.name, c.phoneNumber)}>
                                <History size={16} /> History
                              </button>
                              <button className="dropdown-item edit-btn" onClick={() => handleEditStart(p, c.phoneNumber, shop)}>
                                {editingProfile?.profileId === p.profileId ? <Save size={16} /> : <Pencil size={16} />}
                                {editingProfile?.profileId === p.profileId ? "Save" : "Edit"}
                              </button>
                              <button className="dropdown-item delete-btn" onClick={() => handleDeleteProfile(p, c.phoneNumber)}>
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
            <h2>{(selectedBills ? "Bill Details" : "Advance History") + " for " + (selectedBills?.profileName || selectedHistory?.profileName)}</h2>
            <p>Phone Number: {selectedBills?.phoneNumber || selectedHistory?.phoneNumber}</p>
            {selectedBills ? (
              selectedBills.bills.length === 0 ? <p className="no-data">No bills available.</p> : selectedBills.bills.map(bill => (
                <div key={bill.billNo} className="bill-details">
                  <h3>Bill No: {bill.billNo}</h3>
                  <p>Date: {bill.date}</p>
                  <p>Payment Method: {bill.paymentMethod}</p>
                  <table className="bill-table">
                    <thead><tr><th>Product</th><th>Qty</th><th>Price/Qty</th><th>Amount</th></tr></thead>
                    <tbody>{bill.items.map((item, i) => <tr key={i}><td>{item.product}</td><td>{item.qty}</td><td>₹{item.pricePerQty}</td><td>₹{item.amount}</td></tr>)}
                      <tr className="total"><td colSpan="3">Total Amount</td><td>₹{bill.totalAmount}</td></tr>
                      {bill.advanceRemaining !== undefined && <tr className="total"><td colSpan="3">Advance Remaining</td><td>₹{bill.advanceRemaining}</td></tr>}</tbody>
                  </table>
                  <button className="print-btn" onClick={() => handlePrintBill(bill, selectedBills.profileName, selectedBills.phoneNumber)}>Print Bill</button>
                </div>
              ))
            ) : selectedHistory.history.length === 0 ? <p className="no-data">No advance history available.</p> : (
              <table className="history-table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
                <tbody>{selectedHistory.history.map((h, i) => <tr key={i}><td>{h.date}</td><td>{h.transactionType}</td><td>₹{h.amount}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancePayments;