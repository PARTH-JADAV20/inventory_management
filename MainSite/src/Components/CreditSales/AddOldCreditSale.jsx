import React, { useState, useEffect } from 'react';
import { addOldCreditSale } from '../api';
import './AddOldCreditSale.css';

function AddOldCreditSale({ onAdd, onCancel, shop }) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    items: [{ product: '', qty: '', unit: '', pricePerUnit: '', amount: '', category: '' }],
    totalAmount: '0.00',
    otherExpenses: '0.00',
    date: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    "Cement",
    "Iron",
    "Pipes",
    "Tools",
    "Iron sheets",
    "Cement sheets",
    "Colour sheets",
    "White cement",
    "Liquids",
    "Wire",
  ];

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    if (index !== null) {
      const newItems = [...newFormData.items];
      newItems[index] = { ...newItems[index], [name]: value };
      if (name === 'qty' || name === 'pricePerUnit') {
        const qty = parseFloat(newItems[index].qty) || 0;
        const price = parseFloat(newItems[index].pricePerUnit) || 0;
        newItems[index].amount = (qty * price).toFixed(2);
      }
      newFormData = { ...newFormData, items: newItems };
    } else {
      newFormData = { ...newFormData, [name]: value };
    }

    setFormData(newFormData);
  };

  useEffect(() => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const otherExpenses = parseFloat(formData.otherExpenses || 0);
    setFormData(prev => ({ ...prev, totalAmount: (itemsTotal + otherExpenses).toFixed(2) }));
  }, [formData.items, formData.otherExpenses]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', qty: '', unit: '', pricePerUnit: '', amount: '', category: '' }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (formData.date && !dateRegex.test(formData.date.replace(/\//g, '-'))) {
      setError('Please enter a valid date in DD-MM-YYYY format');
      setLoading(false);
      return;
    }

    try {
      const [day, month, year] = formData.date.split('-');
      const isoDate = `${year}-${month}-${day}`; // Convert to ISO for backend
      const saleData = {
        ...formData,
        date: isoDate,
        isOld: true, // Mark as old bill
        items: formData.items.map(item => ({
          ...item,
          qty: parseFloat(item.qty) || 0,
          pricePerUnit: parseFloat(item.pricePerUnit) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        totalAmount: parseFloat(formData.totalAmount) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
      };

      const response = await addOldCreditSale(shop, saleData);
      setSuccess('Old credit sale added successfully!');
      onAdd(response);
      setFormData({
        customerName: '',
        phoneNumber: '',
        items: [{ product: '', qty: '', unit: '', pricePerUnit: '', amount: '', category: '' }],
        totalAmount: '0.00',
        otherExpenses: '0.00',
        date: '',
      });
    } catch (err) {
      setError('Failed to add old credit sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    // Convert ISO date (YYYY-MM-DD) from calendar to DD-MM-YYYY
    if (value.includes('-') && value.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      value = `${day}-${month}-${year}`;
    }
    setFormData({ ...formData, date: value });
  };

  return (
    <div className="add-old-credit-sale-dax">
      <h1 className="form-title-dax">Add Old Credit Sale</h1>
      {error && <div className="error-message-dax">{error}</div>}
      {success && <div className="success-message-dax">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-dax">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div className="form-group-dax">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="form-group-dax">
          <label>Date (DD-MM-YYYY):</label>
          <input
            type="text"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            placeholder="DD-MM-YYYY or select from calendar"
            required
            pattern="\d{2}-\d{2}-\d{4}"
            title="Please enter date in DD-MM-YYYY format"
          />
          <input
            type="date"
            className="calendar-input-dax"
            onChange={(e) => handleDateChange(e)}
          />
        </div>
        <h2>Items</h2>
        {formData.items.map((item, index) => (
          <div key={index} className="item-row-dax">
            <div className="form-group-dax">
              <label>Product:</label>
              <input
                type="text"
                name="product"
                value={item.product}
                onChange={e => handleInputChange(e, index)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group-dax">
              <label>Quantity:</label>
              <input
                type="number"
                name="qty"
                value={item.qty}
                onChange={e => handleInputChange(e, index)}
                placeholder="Quantity"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="form-group-dax">
              <label>Unit:</label>
              <input
                type="text"
                name="unit"
                value={item.unit}
                onChange={e => handleInputChange(e, index)}
                placeholder="Unit (e.g., kg)"
                required
              />
            </div>
            <div className="form-group-dax">
              <label>Price per Unit:</label>
              <input
                type="number"
                name="pricePerUnit"
                value={item.pricePerUnit}
                onChange={e => handleInputChange(e, index)}
                placeholder="Price per unit"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="form-group-dax">
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={item.amount}
                placeholder="Amount"
                readOnly
              />
            </div>
            <div className="form-group-dax">
              <label>Category:</label>
              <select
                name="category"
                value={item.category}
                onChange={e => handleInputChange(e, index)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {formData.items.length > 1 && (
              <button type="button" className="remove-item-btn-dax" onClick={() => removeItem(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-item-btn-dax" onClick={addItem}>
          Add Item
        </button>
        <div className="form-group-dax">
          <label>Other Expenses:</label>
          <input
            type="number"
            name="otherExpenses"
            value={formData.otherExpenses}
            onChange={handleInputChange}
            placeholder="Other expenses"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group-dax">
          <label>Total Amount:</label>
          <input
            type="text"
            name="totalAmount"
            value={formData.totalAmount}
            placeholder="Total amount"
            readOnly
          />
        </div>
        <div className="form-actions-dax">
          <button type="submit" className="submit-btn-dax" disabled={loading}>
            {loading ? 'Submitting...' : 'Add Old Credit Sale'}
          </button>
          <button type="button" className="cancel-btn-dax" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddOldCreditSale;