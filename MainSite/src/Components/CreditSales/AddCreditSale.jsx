import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, AlertCircle } from "lucide-react";
import { fetchCustomers, addCreditSale } from "../api.js";
import "./AddCreditSale.css";

const AddCreditSale = ({ onAdd, onCancel, shop = "Shop 1", stock = [] }) => {
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

  const units = ["Kg", "Bag", "Litre", "Piece", "Truck"];

  useEffect(() => {
    if (isExistingCustomer) {
      setLoading(true);
      fetchCustomers(shop, customerSearch)
        .then((data) => {
          setCustomers(data);
          setLoading(false);
        })
        .catch((err) => {
          setWarning(err.message || "Failed to fetch customers");
          setLoading(false);
        });
    }
  }, [isExistingCustomer, shop, customerSearch]);

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
    if (field === "product" && !updatedItems[index].isManualProduct) {
      const selectedStock = stock.find((s) => s.name === value);
      if (selectedStock) {
        updatedItems[index].unit = selectedStock.unit;
        updatedItems[index].pricePerUnit = selectedStock.price.toString();
      } else {
        updatedItems[index].unit = "";
        updatedItems[index].pricePerUnit = "";
      }
    }
    setItems(updatedItems);
  };

  const handleToggleManualProduct = (index) => {
    const updatedItems = [...items];
    updatedItems[index].isManualProduct = !updatedItems[index].isManualProduct;
    updatedItems[index].product = "";
    updatedItems[index].unit = "";
    updatedItems[index].pricePerUnit = "";
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
      if (!item.isManualProduct) {
        const stockItem = stock.find((s) => s.name === item.product && s.unit === item.unit);
        if (!stockItem || stockItem.quantity < qty) {
          setWarning(`Insufficient stock for ${item.product} (${item.unit})`);
          return;
        }
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
      const newSale = await addCreditSale(shop, saleData);
      onAdd(newSale);
      setWarning("");
      setFormData({ customerName: "", phone: "" });
      setItems([{ product: "", qty: "", unit: "", pricePerUnit: "", date: today, isManualProduct: false }]);
      setSelectedCustomer(null);
      setIsExistingCustomer(false);
    } catch (error) {
      setWarning(error.message || "Failed to add credit sale");
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
    <div className="add-credit-sale-container-dax">
      <h2>Add Credit Sale</h2>
      <form className="add-credit-sale-form-dax" onSubmit={handleSubmit}>
        <div className="customer-details-section-dax">
          <div className="form-group-dax">
            <label>Customer Type</label>
            <div className="checkbox-container-dax">
              <input
                type="checkbox"
                checked={isExistingCustomer}
                onChange={(e) => setIsExistingCustomer(e.target.checked)}
                disabled={loading}
              />
              <span>Use Existing Customer</span>
            </div>
          </div>
          {isExistingCustomer ? (
            <div className="form-group-dax search-group-dax">
              <label>Search Customer</label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name or phone"
                disabled={loading}
                className="search-input-dax"
              />
              {customerSearch && !loading && filteredCustomers.length > 0 && (
                <div className="customer-dropdown-dax">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.phoneNumber}
                      className="customer-option-dax"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {customer.name} ({customer.phoneNumber})
                    </div>
                  ))}
                </div>
              )}
              {customerSearch && !loading && filteredCustomers.length === 0 && (
                <div className="no-results-dax">No customers found</div>
              )}
            </div>
          ) : (
            <div className="new-customer-fields-dax">
              <div className="form-group-dax">
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
              <div className="form-group-dax">
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
            </div>
          )}
        </div>

        {(selectedCustomer || formData.customerName) && (
          <div className="selected-customer-header-dax">
            <h3>Adding items for: {selectedCustomer ? selectedCustomer.name : formData.customerName}</h3>
          </div>
        )}

        <div className="items-section-dax">
          <label className="items-label-dax">Items</label>
          {items.map((item, index) => (
            <div key={index} className="item-row-dax">
              <div className="form-group-dax">
                <label>Product</label>
                <div className="checkbox-container-dax">
                  <input
                    type="checkbox"
                    checked={item.isManualProduct}
                    onChange={() => handleToggleManualProduct(index)}
                    disabled={loading}
                  />
                  <span>Manual Product</span>
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
                    {stock.map((prod) => (
                      <option key={`${prod.name}|${prod.unit}`} value={prod.name}>
                        {prod.name} (Qty: {prod.quantity} {prod.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group-dax">
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
              <div className="form-group-dax">
                <label>Unit</label>
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  required
                  disabled={loading || !item.isManualProduct}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-dax">
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
              <div className="form-group-dax">
                <label>Date</label>
                <div className="date-picker-wrapper-dax">
                  <DatePicker
                    selected={item.date}
                    onChange={(date) => handleItemChange(index, "date", date)}
                    dateFormat="dd MMMM yyyy"
                    className="date-input-dax"
                    placeholderText="Select date"
                    required
                    disabled={loading}
                  />
                  <Calendar size={16} className="calendar-icon-dax" />
                </div>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  className="remove-item-btn-dax"
                  onClick={() => handleRemoveItem(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-item-btn-dax"
            onClick={handleAddItem}
            disabled={loading}
          >
            Add Another Item
          </button>
        </div>
        <div className="form-buttons-dax">
          <button type="submit" className="submit-btn-dax" disabled={loading}>
            {loading ? "Adding..." : "Add Credit Sale"}
          </button>
          <button type="button" className="cancel-btn-dax" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
        {warning && (
          <div className="warning-message-dax">
            <AlertCircle size={16} />
            <span>{warning}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddCreditSale;