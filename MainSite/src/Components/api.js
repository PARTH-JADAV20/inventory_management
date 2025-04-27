// src/api.js
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://localhost:5000/api'; 

// Helper function to get the stock endpoint for a specific shop
const getStockUrl = (shop) => `${API_BASE_URL}/${shop}/stock`;

// Get all stock items for a shop
export const getStock = async (shop, category = '', search = '', view = 'current') => {
  try {
    const response = await axios.get(getStockUrl(shop), {
      params: { category, search, view },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock items');
  }
};

// Add a new stock item
export const addStock = async (shop, stockItem) => {
  try {
    const response = await axios.post(getStockUrl(shop), stockItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add stock item');
  }
};

// Update an existing stock item
export const updateStock = async (shop, id, stockItem) => {
  try {
    const response = await axios.put(`${getStockUrl(shop)}/${id}`, stockItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update stock item');
  }
};

// Delete stock items by name, category, and unit
export const deleteStock = async (shop, { id, name, category, unit }) => {
  try {
    const response = await axios.delete(`${getStockUrl(shop)}/${id}`, {
      data: { name, category, unit },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete stock items');
  }
};


const BASE_URL = 'http://localhost:5000/api';

// Map shop names to API-compatible shop IDs
const getShopId = (shopName) => {
  return shopName === 'Shop 1' ? 'shop1' : 'shop2';
};

// Get all expenses with optional filters
export const getExpenses = async (shop, filters = {}) => {
  const shopId = getShopId(shop);
  const queryParams = new URLSearchParams(filters).toString();
  const url = `${BASE_URL}/${shopId}/expenses${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  
  return response.json();
};

// Add a new expense
export const addExpense = async (shop, expenseData) => {
  const shopId = getShopId(shop);
  const response = await fetch(`${BASE_URL}/${shopId}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add expense');
  }
  
  return response.json();
};

// Update an existing expense
export const updateExpense = async (shop, id, expenseData) => {
  const shopId = getShopId(shop);
  const response = await fetch(`${BASE_URL}/${shopId}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update expense');
  }
  
  return response.json();
};

// Delete an expense
export const deleteExpense = async (shop, id) => {
  const shopId = getShopId(shop);
  const response = await fetch(`${BASE_URL}/${shopId}/expenses/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete expense');
  }
  
  return response.json();
};