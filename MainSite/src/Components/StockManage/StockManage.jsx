import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ShopContext } from '../ShopContext/ShopContext';
import { fetchStock, fetchCurrentStock, addStockItem, updateStockItem, deleteStockItems } from '../api.js'; // Updated imports
import './StockManage.css';

const StockManage = () => {
  const getCurrentISTDate = () => {
    const now = new Date();
    const istOffsetMinutes = 5.5 * 60; // 5 hours 30 minutes
    const istDate = new Date(now.getTime() + (istOffsetMinutes * 60 * 1000));
    return istDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };
  const [items, setItems] = useState([]);
  const { shop, setShop } = useContext(ShopContext)
  const [categories] = useState([
    "Cement",
    "Iron",
    "Pipes",
    "Tools",
    "Iron sheets",
    "Cement sheets",
    "Colour sheets ",
    "White cement",
    "Liquids",
    "Wire",
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
    addedDate: getCurrentISTDate(),
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
  const processGroupedItems = useCallback(
    (itemsToProcess) => {
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

      return filtered;
    },
    [filterCategory, searchTerm]
  );

  // Group items case-insensitively by name, category, unit
  const groupItemsCaseInsensitive = (items) => {
    const grouped = {};

    items.forEach((item) => {
      // Normalize keys to lowercase for grouping
      const key = `${item.name.toLowerCase()}|${(item.category || 'Uncategorized').toLowerCase()}|${item.unit.toLowerCase()}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: item.id, // Use the first item's ID
          name: item.name, // Preserve original case for display
          category: item.category || 'Uncategorized', // Preserve original case
          unit: item.unit, // Preserve original case
          quantity: 0,
          totalPrice: 0,
          count: 0,
        };
      }
      grouped[key].quantity += parseFloat(item.quantity) || 0;
      grouped[key].totalPrice += (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
      grouped[key].count += 1;
    });

    // Convert grouped object to array with average price
    return Object.values(grouped).map((group) => ({
      ...group,
      price: group.count > 0 ? group.totalPrice / group.quantity : 0, // Weighted average price
    }));
  };

  // Update useEffect for fetching and grouping stock
  useEffect(() => {
    if (showAveragePrices) {
      const fetchGroupedStock = async () => {
        try {
          setError(null);
          const data = await fetchStock(shop); // Fetch raw stock data
          const grouped = groupItemsCaseInsensitive(data); // Group case-insensitively
          const processedItems = processGroupedItems(grouped); // Apply filters
          setGroupedItems(processedItems);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchGroupedStock();
    }
  }, [shop, filterCategory, searchTerm, showAveragePrices, processGroupedItems]);

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
        id: item.id,
      });
      const updatedItems = items.filter((i) => i.id !== item.id);
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
      addedDate: getCurrentISTDate(),
    });
    setIsCustomCategory(false);
    setIsCustomUnit(false);
  };

  return (
    <div className="main-content">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Loading...</div>}
      <div className="stock-form-container">
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
                step="1"
                name="quantity"
                placeholder="Qty"
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
              step="1"
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
              <th>Sr.No</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Purchase Price</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item,index) => (
              <tr key={item.id}>
                <td style={{fontWeight:"bolder", color : "#ff6b2c"}}>{index + 1}</td>
                <td>{item.name}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.category}</td>
                <td>₹{item.price.toFixed(2)}/{item.unit}</td>
                <td>
                  {item.addedDate && !isNaN(new Date(item.addedDate))
                    ? (() => {
                      const date = new Date(item.addedDate);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()
                    : 'N/A'}
                </td>
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
                  <tr key={`${item.id}-${item.category}-${item.unit}`}>
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