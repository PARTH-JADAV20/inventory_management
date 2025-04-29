import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const AddCreditSale = ({ onAdd, onCancel, shop = "shop1" }) => {
  const today = new Date();
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([
    { product: "", qty: "", unit: "", pricePerUnit: "", date: today, isManualProduct: false },
  ]);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
  });
  const [warning, setWarning] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000";

  const products = [
    "Cement (Ambuja)",
    "Cement (UltraTech)",
    "Steel Rod (Tata)",
    "Sand",
    "Bricks",
  ];
  const units = ["Kg", "Bag", "Litre", "Piece", "Truck"];

  useEffect(() => {
    if (isExistingCustomer) {
      setLoading(true);
      fetch(`${API_URL}/api/${shop}/customers`)
        .then((res) => res.json())
        .then((data) => {
          setCustomers(data);
          setLoading(false);
        })
        .catch(() => {
          setWarning("Failed to fetch customers");
          setLoading(false);
        });
    }
  }, [isExistingCustomer, shop]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({ customerName: customer.name, phone: customer.phoneNumber });
    setCustomerSearch("");
  };

  const handleAddItem = () => {
    setItems([...items, { product: "", qty: "", unit: "", pricePerUnit: "", date: today, isManualProduct: false }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleToggleManualProduct = (index) => {
    const updatedItems = [...items];
    updatedItems[index].isManualProduct = !updatedItems[index].isManualProduct;
    updatedItems[index].product = "";
    setItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setWarning("At least one item is required");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const parseDate = (date) => {
    try {
      return format(date, "yyyy-MM-dd");
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      setWarning("Please provide customer name and phone");
      return;
    }
    for (let item of items) {
      if (!item.product || !item.qty || !item.unit || !item.pricePerUnit || !item.date) {
        setWarning("Please fill all item fields");
        return;
      }
      const qty = parseFloat(item.qty);
      const price = parseFloat(item.pricePerUnit);
      if (qty <= 0 || price <= 0) {
        setWarning("Quantity and price must be positive");
        return;
      }
      const parsedDate = parseDate(item.date);
      if (!parsedDate) {
        setWarning("Invalid date");
        return;
      }
    }
    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.qty) * parseFloat(item.pricePerUnit),
      0
    );
    const formattedItems = items.map((item) => ({
      product: item.product,
      qty: parseFloat(item.qty),
      unit: item.unit,
      pricePerUnit: parseFloat(item.pricePerUnit),
      amount: parseFloat(item.qty) * parseFloat(item.pricePerUnit),
      date: parseDate(item.date),
    }));
    const saleData = {
      customerName: formData.customerName,
      phoneNumber: formData.phone,
      items: formattedItems,
      totalAmount,
    };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/${shop}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add credit sale");
      }
      const newSale = await res.json();
      onAdd(newSale);
      setWarning("");
    } catch (error) {
      setWarning(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phoneNumber.includes(customerSearch)
  );

  return (
    <div className="form-container">
      <h2>Add Credit Sale</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="customer-details-row">
          <div className="form-group">
            <label>Customer Type</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={isExistingCustomer}
                onChange={(e) => setIsExistingCustomer(e.target.checked)}
              />
              Use Existing Customer
            </div>
          </div>
          {isExistingCustomer ? (
            <div className="form-group search-group">
              <label>Search Customer</label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name or phone"
                disabled={loading}
              />
              {customerSearch && !loading && filteredCustomers.length > 0 && (
                <div className="customer-dropdown">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.phoneNumber}
                      className="customer-option"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {customer.name} ({customer.phoneNumber})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}
        </div>

        {(selectedCustomer || formData.customerName) && (
          <div className="selected-customer-header">
            <h3>Adding items for: {selectedCustomer ? selectedCustomer.name : formData.customerName}</h3>
          </div>
        )}

        <div className="items-section">
          <label className="items-label">Items</label>
          {items.map((item, index) => (
            <div key={index} className={items.length <= 2 ? "item-group-horizontal" : "item-group-vertical"}>
              <div className="form-group">
                <label>Product</label>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={item.isManualProduct}
                    onChange={() => handleToggleManualProduct(index)}
                    disabled={loading}
                  />
                  Manual Product
                </div>
                {item.isManualProduct ? (
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    placeholder="Enter product name"
                    required
                    disabled={loading}
                  />
                ) : (
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Product</option>
                    {products.map((prod) => (
                      <option key={prod} value={prod}>
                        {prod}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                  placeholder="Enter quantity"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price per Unit (₹)</label>
                <input
                  type="number"
                  value={item.pricePerUnit}
                  onChange={(e) => handleItemChange(index, "pricePerUnit", e.target.value)}
                  placeholder="Enter price per unit"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <div className="date-picker-wrapper">
                  <DatePicker
                    selected={item.date}
                    onChange={(date) => handleItemChange(index, "date", date)}
                    dateFormat="dd MMMM yyyy"
                    className="date-input"
                    placeholderText="Select date"
                    required
                    disabled={loading}
                  />
                  <Calendar size={16} className="calendar-icon" />
                </div>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  className="cancel-btn remove-item-btn"
                  onClick={() => handleRemoveItem(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="submit-btn add-item-btn" onClick={handleAddItem} disabled={loading}>
            Add Another Item
          </button>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Credit Sale"}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
        {warning && <div className="warning">{warning}</div>}
      </form>
    </div>
  );
};

export default AddCreditSale;