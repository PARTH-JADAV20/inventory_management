import React, { useState } from "react";
import { format, parse } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const AddCreditSale = ({ onAdd, onCancel, existingCustomers }) => {
  const today = new Date();
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [isManualProduct, setIsManualProduct] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([
    { product: "", qty: "", unit: "", pricePerUnit: "", date: today },
  ]);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
  });
  const [warning, setWarning] = useState("");

  const products = [
    "Cement (Ambuja)",
    "Cement (UltraTech)",
    "Steel Rod (Tata)",
    "Sand",
    "Bricks",
  ];
  const units = ["Kg", "Bag", "Litre", "Piece", "Truck"];

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({ customerName: customer.name, phone: customer.phone });
    setCustomerSearch("");
  };

  const handleAddItem = () => {
    setItems([...items, { product: "", qty: "", unit: "", pricePerUnit: "", date: today }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      setWarning("Please provide customer name and phone");
      return;
    }
    for (let item of items) {
      if (
        !item.product ||
        !item.qty ||
        !item.unit ||
        !item.pricePerUnit ||
        !item.date
      ) {
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
    const totalCredit = items.reduce(
      (sum, item) => sum + parseFloat(item.qty) * parseFloat(item.pricePerUnit),
      0
    );
    const formattedItems = items.map((item) => ({
      product: item.product,
      qty: parseFloat(item.qty),
      unit: item.unit,
      pricePerUnit: parseFloat(item.pricePerUnit),
      date: parseDate(item.date),
    }));
    onAdd({
      customerName: formData.customerName,
      phone: formData.phone,
      totalCredit,
      lastTransaction: parseDate(items[items.length - 1].date),
      status: "Open",
      items: formattedItems,
    });
    setWarning("");
  };

  const filteredCustomers = existingCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch)
  );

  return (
    <div className="form-container">
      <h2>Add Credit Sale</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label>Search Customer</label>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by name or phone"
            />
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="customer-dropdown">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.phone}
                    className="customer-option"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    {customer.name} ({customer.phone})
                  </div>
                ))}
              </div>
            )}
            {selectedCustomer && (
              <div className="selected-customer">
                Selected: {selectedCustomer.name} ({selectedCustomer.phone})
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
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label>Items</label>
          {items.map((item, index) => (
            <div key={index} className={items.length === 1 ? "item-group-horizontal" : "item-group"}>
              <div className="form-group">
                <label>Product</label>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isManualProduct}
                    onChange={(e) => setIsManualProduct(e.target.checked)}
                  />
                  Manual Product
                </div>
                {isManualProduct ? (
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                ) : (
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    required
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
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  required
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
                  />
                  <Calendar size={16} className="calendar-icon" />
                </div>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="submit-btn" onClick={handleAddItem}>
            Add Another Item
          </button>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            Add Credit Sale
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
        {warning && <div className="warning">{warning}</div>}
      </form>
    </div>
  );
};

export default AddCreditSale;