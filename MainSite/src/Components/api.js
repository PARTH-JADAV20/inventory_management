// const BASE_URL = 'https://inventory-management-1-461p.onrender.com/api';
// const BASE_URL = 'http://bussinespro-env.eba-37zmk5ee.ap-south-1.elasticbeanstalk.com/api';
const BASE_URL = 'https://d3o2vhbxligxnl.cloudfront.net/api';
// const BASE_URL = 'http://localhost:5000/api';

// Helper function to handle fetch requests
async function request(method, url, data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${BASE_URL}${url}`, options);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  } catch (error) {
    console.error(`Error in ${method} ${url}:`, error.message);
    throw error;
  }
}

// Stock Management APIs
export const fetchStock = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/stock`);
};

export const fetchCurrentStock = async (shop, category = '', search = '') => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  return request('GET', `/${encodeURIComponent(shop)}/stock/current?${params}`);
};

export const addStockItem = async (shop, item) => {
  return request('POST', `/${encodeURIComponent(shop)}/stock`, item);
};

export const updateStockItem = async (shop, id, item) => {
  return request('PUT', `/${encodeURIComponent(shop)}/stock/${id}`, item);
};

export const deleteStockItems = async (shop, { id }) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/stock`, { id });
};

// Sales APIs
export const createSale = async (shop, saleData) => {
  return request('POST', `/${encodeURIComponent(shop)}/sales`, saleData);
};

export const fetchSales = async (shop, date = '', search = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (search) params.append('search', search);
  return request('GET', `/${encodeURIComponent(shop)}/sales?${params}`);
};

export const deleteSale = async (shop, billNo, profileId, phoneNumber, items) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/sales/${billNo}`, { profileId, phoneNumber, items });
};

export const fetchNextBillNumber = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/next-bill-number`);
};

// Expense APIs
export const fetchExpenses = async (shop, date = '', paidTo = '') => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (paidTo) params.append('paidTo', paidTo);
    const data = await request('GET', `/${encodeURIComponent(shop)}/expenses?${params}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch expenses for ${shop}: ${error.message}`);
  }
};

export const addExpense = async (shop, expense) => {
  return request('POST', `/${encodeURIComponent(shop)}/expenses`, expense);
};

export const updateExpense = async (shop, id, expense) => {
  return request('PUT', `/${encodeURIComponent(shop)}/expenses/${id}`, expense);
};

export const deleteExpense = async (shop, id) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/expenses/${id}`);
};

// Customer APIs
export const fetchCustomers = async (shop, search = '', deleted = false) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (deleted) params.append('deleted', deleted);
    const data = await request('GET', `/${encodeURIComponent(shop)}/customers?${params}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch customers for ${shop}: ${error.message}`);
  }
};

export const createCustomer = async (shop, customerData) => {
  return request('POST', `/${encodeURIComponent(shop)}/customers`, customerData);
};

export const fetchCustomerByPhone = async (shop, phoneNumber) => {
  return request('GET', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}`);
};

export const appendCustomerProfile = async (shop, phoneNumber, profileData) => {
  try {
    const data = await request('POST', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles`, profileData);
    return data;
  } catch (error) {
    throw new Error(`Failed to append profile for ${phoneNumber} in ${shop}: ${error.message}`);
  }
};

export const updateCustomerProfile = async (shop, phoneNumber, profileId, profileData) => {
  return request('PUT', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}`, profileData);
};

export const softDeleteCustomerProfile = async (shop, phoneNumber, profileId) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}`);
};

export const restoreCustomerProfile = async (shop, phoneNumber, profileId) => {
  return request('PUT', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}/restore`);
};

export const permanentDeleteCustomerProfile = async (shop, phoneNumber, profileId) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}/permanent`);
};

export const softDeleteCustomerProfileNew = async (shop, phoneNumber, profileId) => {
  return request('PUT', `/${encodeURIComponent(shop)}/customers/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}/softdelete`);
};

// Advance Payment APIs
export const addAdvancePayment = async (shop, phoneNumber, profileId, advanceData) => {
  return request('POST', `/${encodeURIComponent(shop)}/advance/${encodeURIComponent(phoneNumber)}/${encodeURIComponent(profileId)}`, advanceData);
};

export const updateAdvanceProfile = async (shop, phoneNumber, profileId, profileData) => {
  return request('PUT', `/${encodeURIComponent(shop)}/advance/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}`, profileData);
};

export const deleteAdvanceProfile = async (shop, phoneNumber, profileId) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/advance/${encodeURIComponent(phoneNumber)}/profiles/${encodeURIComponent(profileId)}`);
};

// Dashboard APIs
export const fetchLowStock = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/low-stock`);
};

export const fetchRecentSales = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/recent-sales`);
};

export const fetchRecentPurchases = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/recent-purchases`);
};

export const fetchProfitTrend = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/profit-trend`);
};

export const fetchSummary = async (shop, date = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  return request('GET', `/${encodeURIComponent(shop)}/summary?${params}`);
};

export const fetchCombinedSummary = async (date = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  return request('GET', `/summary?${params}`);
};

// Credit Sales APIs
export const fetchCreditSales = async (shop, page = 1, limit = 10, sortBy = 'lastTransactionDate', sortOrder = 'desc', search = '', showDeleted = false) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);
  if (search) params.append('search', search);
  if (showDeleted) params.append('showDeleted', showDeleted);
  return request('GET', `/${encodeURIComponent(shop)}/credits?${params}`);
};

export const addCreditSale = async (shop, saleData) => {
  return request('POST', `/${encodeURIComponent(shop)}/credits`, saleData);
};

export const addCreditPayment = async (shop, id, paymentData) => {
  return request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`, { payment: paymentData });
};

export const closeCreditSale = async (shop, id, status = 'Cleared', paymentData = null) => {
  const updateData = { status };
  if (paymentData) {
    updateData.payment = paymentData;
  }
  return request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`, updateData);
};

export const addCreditRefund = async (shop, id, refundData) => {
  return request('POST', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/refund`, refundData);
};

export const updateCreditPayment = async (shop, id, paymentId, paymentData) => {
  return request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/payment/${encodeURIComponent(paymentId)}`, paymentData);
};

export const deleteCreditPayment = async (shop, id, paymentId) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/payment/${encodeURIComponent(paymentId)}`);
};

export const deleteCreditSale = async (shop, id) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`);
};

export const restoreCreditSale = async (shop, id) => {
  return request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/restore`);
};

export const permanentDeleteCreditSale = async (shop, id) => {
  return request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/permanent`);
};

export const fetchDeletedCreditSales = async (shop) => {
  return request('GET', `/${encodeURIComponent(shop)}/credits/deleted`);
};