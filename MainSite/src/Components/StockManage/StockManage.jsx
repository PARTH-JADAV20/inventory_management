import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchStock, fetchCurrentStock, addStockItem, updateStockItem, deleteStockItems } from '../api.js'; // Updated imports
import './StockManage.css';

const StockManage = () => {
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState('Shop 1'); // Updated to match backend: "Shop 1" instead of "shop1"
  const [categories] = useState([
    'Cement',
    'Sand',
    'Aggregate',
    'Steel',
    'Bricks',
    'Paint',
    'Plumbing',
    'Electrical',
    'Wood',
  ]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'KG',
    category: 'Cement',
    price: '',
    addedDate: new Date().toISOString().split('T')[0],
  });
  const [editingItem, setEditingItem] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAveragePrices, setShowAveragePrices] = useState(false);
  const [groupedItems, setGroupedItems] = useState([]); // Added for average prices from fetchCurrentStock

  const processItems = useCallback(
    (itemsToProcess) => {
      // Filter items for current stock table (no grouping)
      let filtered = [...itemsToProcess];

      if (filterCategory !== 'All') {
        filtered = filtered.filter(
          (item) => (item.category || 'Uncategorized').toLowerCase() === filterCategory.toLowerCase()
        );
      }

      if (searchTerm) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by addedDate (newest first) for current stock
      filtered = filtered.sort(
        (a, b) => new Date(b.addedDate) - new Date(a.addedDate)
      );

      return { filtered };
    },
    [filterCategory, searchTerm]
  );

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      try {
        setError(null);
        const data = await fetchStock(shop); // Updated to use fetchStock
        console.log('fetchStock response:', data);
        setItems(data);
        const { filtered } = processItems(data);
        setFilteredItems(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStockData();
  }, [shop, processItems]);

  useEffect(() => {
    const { filtered } = processItems(items);
    setFilteredItems(filtered);
  }, [filterCategory, searchTerm, items, processItems]);

  // Fetch grouped items for average prices when popup is opened
  useEffect(() => {
    if (showAveragePrices) {
      const fetchGroupedStock = async () => {
        try {
          setError(null);
          const data = await fetchCurrentStock(shop, filterCategory, searchTerm); // Use fetchCurrentStock
          console.log('fetchCurrentStock response:', data);
          setGroupedItems(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchGroupedStock();
    }
  }, [shop, filterCategory, searchTerm, showAveragePrices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]:
        name === 'quantity' || name === 'price'
          ? value === ''
            ? ''
            : parseFloat(value)
          : value,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.quantity ||
      !newItem.price ||
      !newItem.category ||
      !newItem.unit ||
      !newItem.addedDate
    ) {
      alert('Please fill all fields');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      if (editingItem) {
        const updatedItem = await updateStockItem(shop, editingItem.id, newItem); // Updated to use updateStockItem
        const updatedItems = items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
        setItems(updatedItems);
        const { filtered } = processItems(updatedItems);
        setFilteredItems(filtered);
        setEditingItem(null);
      } else {
        const addedItem = await addStockItem(shop, newItem); // Updated to use addStockItem
        const updatedItems = [...items, addedItem];
        setItems(updatedItems);
        const { filtered } = processItems(updatedItems);
        setFilteredItems(filtered);
      }

      setNewItem({
        name: '',
        quantity: '',
        unit: 'KG',
        category: 'Cement',
        price: '',
        addedDate: new Date().toISOString().split('T')[0],
      });
      setIsCustomCategory(false);
      setIsCustomUnit(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      price: item.price,
      addedDate: new Date(item.addedDate).toISOString().split('T')[0],
    });
    setIsCustomCategory(!categories.includes(item.category));
    setIsCustomUnit(!['KG', 'Bag', 'Pieces', 'Liter'].includes(item.unit));
  };

  const handleDelete = async (item) => {
    try {
      setError(null);
      setIsLoading(true);
      await deleteStockItems(shop, {
        name: item.name,
        category: item.category || 'Uncategorized',
        unit: item.unit,
      }); // Updated to use deleteStockItems with correct payload
      const updatedItems = items.filter(
        (i) =>
          !(
            i.name.toLowerCase() === item.name.toLowerCase() &&
            (i.category || 'Uncategorized').toLowerCase() === (item.category || 'Uncategorized').toLowerCase() &&
            i.unit.toLowerCase() === item.unit.toLowerCase()
          )
      );
      setItems(updatedItems);
      const { filtered } = processItems(updatedItems);
      setFilteredItems(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({
      name: '',
      quantity: '',
      unit: 'KG',
      category: 'Cement',
      price: '',
      addedDate: new Date().toISOString().split('T')[0],
    });
    setIsCustomCategory(false);
    setIsCustomUnit(false);
  };

  return (
    <div className="main-content">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Loading...</div>}
      <div className="stock-form-container">
        <div className="form-group shop-selector">
          <label>Shop</label>
          <select value={shop} onChange={(e) => setShop(e.target.value)}>
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <h2>
          {editingItem ? 'Edit Stock Item' : 'Add New Stock'} -{' '}
          {shop === 'Shop 1' ? 'Shop 1' : 'Shop 2'}
        </h2>
        <div className="stock-form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="addedDate"
              value={newItem.addedDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter item name"
              value={newItem.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <div>Quantity</div>
              <div className="custom-category-checkbox">
                <input
                  type="checkbox"
                  checked={isCustomUnit}
                  onChange={(e) => setIsCustomUnit(e.target.checked)}
                />
                Custom Unit
              </div>
            </label>
            <div className="quantity-group">
              <input
                type="number"
                name="quantity"
                placeholder="Amount"
                value={newItem.quantity}
                onChange={handleInputChange}
              />
              {isCustomUnit ? (
                <input
                  type="text"
                  name="unit"
                  placeholder="Enter custom unit"
                  value={newItem.unit}
                  onChange={handleInputChange}
                />
              ) : (
                <select
                  name="unit"
                  value={newItem.unit}
                  onChange={handleInputChange}
                >
                  <option value="KG">KG</option>
                  <option value="Bag">Bag</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Liter">Liter</option>
                </select>
              )}
            </div>
          </div>
          <div className="form-group">
            <div className="category-group">
              <label className="checkbox-label">
                <div>Category</div>
                <div className="custom-category-checkbox">
                  <input
                    type="checkbox"
                    checked={isCustomCategory}
                    onChange={(e) => setIsCustomCategory(e.target.checked)}
                  />
                  Custom Category
                </div>
              </label>
              {isCustomCategory ? (
                <input
                  type="text"
                  name="category"
                  placeholder="Enter custom category"
                  value={newItem.category}
                  onChange={handleInputChange}
                />
              ) : (
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Purchase Price (₹)</label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              value={newItem.price}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-buttons">
            <button
              className="add-btn"
              onClick={handleAddItem}
              disabled={isLoading}
            >
              {editingItem ? 'Update Stock' : 'Add Stock'}
            </button>
            {editingItem && (
              <button
                className="cancel-btn"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stock-list-container">
        <div className="stock-filter">
          <label>Current Stock:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="search-input"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="toggle-btn"
            onClick={() => setShowAveragePrices(true)}
          >
            Show Average Prices
          </button>
        </div>

        <table className="stock-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Purchase Price</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.category}</td>
                <td>₹{item.price.toFixed(2)}/{item.unit}</td>
                <td>{new Date(item.addedDate).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                    disabled={isLoading}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAveragePrices && (
        <div className="average-price-popup">
          <div className="average-price-content">
            <h3>Average Prices</h3>
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Average Price</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>₹{item.price.toFixed(2)}/{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="close-btn"
              onClick={() => setShowAveragePrices(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManage;