import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { stockItems, stockItems2 } from "../stockItems.js";
import "./StockManage.css";

const StockManage = () => {
  const [items, setItems] = useState(stockItems); // Shop 1 stock
  const [items2, setItems2] = useState(stockItems2); // Shop 2 stock
  const [shop, setShop] = useState("Shop 1"); // Active shop
  const [categories] = useState([
    "Cement",
    "Sand",
    "Aggregate",
    "Steel",
    "Bricks",
    "Paint",
    "Plumbing",
    "Electrical",
    "Wood",
  ]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "KG",
    category: "Cement",
    price: "",
    addedDate: new Date().toISOString().split("T")[0], // Default to today
  });
  const [editingItem, setEditingItem] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [view, setView] = useState("current"); // Toggle between current and history

  useEffect(() => {
    // Start with a fresh filtered array
    let filtered = shop === "Shop 1" ? [...items] : [...items2];

    // Apply category filter
    if (filterCategory !== "All") {
      filtered = filtered.filter((item) => (item.category || "Uncategorized") === filterCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Process based on view
    if (view === "current") {
      const groupedItems = [];
      const uniqueKeys = new Set();

      filtered.forEach((item) => {
        const category = item.category || "Uncategorized";
        const key = `${item.name}|${category}|${item.unit}`;
        if (!uniqueKeys.has(key)) {
          uniqueKeys.add(key);
          const sameItems = filtered.filter(
            (i) => i.name === item.name && (i.category || "Uncategorized") === category && i.unit === item.unit
          );
          const totalQuantity = sameItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
          const averagePrice =
            sameItems.length > 0
              ? (sameItems.reduce((sum, i) => sum + (i.price || 0), 0) / sameItems.length).toFixed(2)
              : "0.00";
          groupedItems.push({
            id: `${item.name}-${category}-${item.unit}-${Date.now()}`, // Unique ID for grouped items
            name: item.name,
            category: category,
            unit: item.unit,
            quantity: totalQuantity,
            price: parseFloat(averagePrice),
          });
        }
      });

      setFilteredItems(groupedItems);
    } else {
      const sortedItems = [...filtered].sort(
        (a, b) => new Date(b.addedDate) - new Date(a.addedDate)
      );
      setFilteredItems(sortedItems);
    }
  }, [items, items2, shop, filterCategory, searchTerm, view]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]:
        name === "quantity" || name === "price"
          ? value === ""
            ? ""
            : parseFloat(value)
          : value,
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddItem = () => {
    if (
      !newItem.name ||
      !newItem.quantity ||
      !newItem.price ||
      !newItem.category ||
      !newItem.unit ||
      !newItem.addedDate
    ) {
      alert("Please fill all fields");
      return;
    }

    if (editingItem) {
      const updateItems = (items, setItems) =>
        items.map((item) =>
          item.id === editingItem.id ? { ...newItem, id: item.id } : item
        );
      if (shop === "Shop 1") {
        setItems(updateItems(items, setItems));
      } else {
        setItems2(updateItems(items2, setItems2));
      }
      setEditingItem(null);
    } else {
      const maxId = (items, items2) =>
        Math.max(
          items.length > 0 ? Math.max(...items.map((item) => item.id)) : 0,
          items2.length > 0 ? Math.max(...items2.map((item) => item.id)) : 0
        );
      const newId = maxId(items, items2) + 1;
      if (shop === "Shop 1") {
        setItems([...items, { ...newItem, id: newId }]);
      } else {
        setItems2([...items2, { ...newItem, id: newId }]);
      }
    }

    setNewItem({
      name: "",
      quantity: "",
      unit: "KG",
      category: "Cement",
      price: "",
      addedDate: new Date().toISOString().split("T")[0], // Reset to today
    });
    setIsCustomCategory(false);
    setIsCustomUnit(false);
  };

  const handleEdit = (item) => {
    // Find the first matching item in the original stock for editing
    const stock = shop === "Shop 1" ? items : items2;
    const targetItem = stock.find(
      (i) => i.name === item.name && i.category === item.category && i.unit === item.unit
    );
    setEditingItem(targetItem);
    setNewItem({
      name: targetItem.name,
      quantity: targetItem.quantity,
      unit: targetItem.unit,
      category: targetItem.category,
      price: targetItem.price,
      addedDate: targetItem.addedDate,
    });
    setIsCustomCategory(!categories.includes(targetItem.category));
    setIsCustomUnit(!["KG", "Bag", "Pieces", "Liter"].includes(targetItem.unit));
  };

  const handleDelete = (item) => {
    // Delete all items with the same name, category, and unit
    const filterItems = (items) =>
      items.filter(
        (i) => !(i.name === item.name && i.category === item.category && i.unit === item.unit)
      );
    if (shop === "Shop 1") {
      setItems(filterItems(items));
    } else {
      setItems2(filterItems(items2));
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({
      name: "",
      quantity: "",
      unit: "KG",
      category: "Cement",
      price: "",
      addedDate: new Date().toISOString().split("T")[0], // Reset to today
    });
    setIsCustomCategory(false);
    setIsCustomUnit(false);
  };

  return (
    <div className="main-content">
      <div className="stock-form-container">
        <div className="form-group shop-selector">
          <label>Shop</label>
          <select value={shop} onChange={(e) => setShop(e.target.value)}>
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <h2>{editingItem ? "Edit Stock Item" : "Add New Stock"} - {shop}</h2>
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
                <select name="unit" value={newItem.unit} onChange={handleInputChange}>
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
                <select name="category" value={newItem.category} onChange={handleInputChange}>
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
            <button className="add-btn" onClick={handleAddItem}>
              {editingItem ? "Update Stock" : "Add Stock"}
            </button>
            {editingItem && (
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stock-list-container">
        <div className="stock-filter">
          <label>{view === "current" ? "Current Stock:" : "Stock History:"}</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
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
            onClick={() => setView(view === "current" ? "history" : "current")}
          >
            {view === "current" ? "View Stock History" : "View Current Stock"}
          </button>
        </div>

        {view === "current" ? (
          <table className="stock-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Average Price</th>
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
                  <td className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>
                      <Pencil size={16} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(item)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="stock-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Added Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>₹{item.price}/{item.unit}</td>
                  <td>{item.addedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockManage;