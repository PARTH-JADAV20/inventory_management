// const BASE_URL = 'https://inventory-management-1-461p.onrender.com/api';
// const BASE_URL = 'http://bussinespro-env.eba-37zmk5ee.ap-south-1.elasticbeanstalk.com/api';
// const BASE_URL = 'https://d3o2vhbxligxnl.cloudfront.net/api';
const BASE_URL = 'http://localhost:5000/api';

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
export const fetchCustomers = async (shop, search = '', deleted = false, page , limit) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (deleted) params.append('deleted', deleted);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
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
export const fetchLowStock = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/low-stock?${params}`);
    return data.map(item => ({
      ...item,
      stock: Math.max(0, item.stock),
      unit: item.unit || 'Unknown'
    }));
  } catch (error) {
    throw new Error(`Failed to fetch low stock for ${shop}: ${error.message}`);
  }
};

export const fetchTotalSales = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/total-sales?${params}`);
    return {
      totalSales: Number(data.totalSales) || 0,
      Cash: Number(data.Cash) || 0,
      Online: Number(data.Online) || 0,
      Cheque: Number(data.Cheque) || 0,
      Credit: Number(data.Credit) || 0,
      Advance: Number(data.Advance) || 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch total sales for ${shop}: ${error.message}`);
  }
};

export const fetchTotalProfit = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/total-profit?${params}`);
    return {
      totalProfit: Number(data.totalProfit) || 0,
      Cash: Number(data.Cash) || 0,
      Online: Number(data.Online) || 0,
      Cheque: Number(data.Cheque) || 0,
      Credit: Number(data.Credit) || 0,
      Advance: Number(data.Advance) || 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch total profit for ${shop}: ${error.message}`);
  }
};

export const fetchUsers = async (shop) => {
  try {
    const data = await request('GET', `/${encodeURIComponent(shop)}/users`);
    return {
      totalUsers: Number(data.totalUsers) || 0,
      creditUsers: Number(data.creditUsers) || 0,
      advanceUsers: Number(data.advanceUsers) || 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch users for ${shop}: ${error.message}`);
  }
};

export const fetchCreditSalesSummary = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/credit-sales?${params}`);
    return {
      totalCreditGiven: Number(data.totalCreditGiven) || 0,
      totalCreditReceived: Number(data.totalCreditReceived) || 0,
      Cash: Number(data.Cash) || 0,
      Online: Number(data.Online) || 0,
      Cheque: Number(data.Cheque) || 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch credit sales summary for ${shop}: ${error.message}`);
  }
};

export const fetchAdvancePayments = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/advance-payments?${params}`);
    return {
      totalAdvance: Number(data.totalAdvance) || 0,
      Cash: Number(data.Cash) || 0,
      Online: Number(data.Online) || 0,
      Cheque: Number(data.Cheque) || 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch advance payments for ${shop}: ${error.message}`);
  }
};

export const fetchRecentPurchases = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/recent-purchases?${params}`);
    return Array.isArray(data) ? data.map(purchase => ({
      ...purchase,
      quantity: Number(purchase.quantity) || 0,
      price: Number(purchase.price) || 0,
      date: purchase.date || new Date().toLocaleDateString('en-GB').split('/').join('-')
    })) : [];
  } catch (error) {
    throw new Error(`Failed to fetch recent purchases for ${shop}: ${error.message}`);
  }
};

export const fetchRecentSales = async (shop, period = '', date = '') => {
  try {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);
    const data = await request('GET', `/${encodeURIComponent(shop)}/recent-sales?${params}`);
    return Array.isArray(data) ? data.map(sale => ({
      ...sale,
      amount: Number(sale.amount) || 0,
      date: sale.date || new Date().toLocaleDateString('en-GB').split('/').join('-'),
      paymentMethod: sale.paymentMethod || 'Cash'
    })) : [];
  } catch (error) {
    throw new Error(`Failed to fetch recent sales for ${shop}: ${error.message}`);
  }
};

// Credit Sales APIs
export const fetchCreditSales = async (shop, page = 1, limit = 10, sortBy = 'lastTransactionDate', sortOrder = 'desc', search = '', showDeleted = false) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    if (search) params.append('search', search);
    params.append('showDeleted', showDeleted);
    const data = await request('GET', `/${encodeURIComponent(shop)}/credits?${params}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch credit sales for ${shop}: ${error.message}`);
  }
};

export const addCreditSale = async (shop, saleData) => {
  try {
    const data = await request('POST', `/${encodeURIComponent(shop)}/credits`, saleData);
    return data;
  } catch (error) {
    throw new Error(`Failed to add credit sale for ${shop}: ${error.message}`);
  }
};

export const addCreditPayment = async (shop, id, paymentData) => {
  try {
    const data = await request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`, { payment: paymentData });
    return data;
  } catch (error) {
    throw new Error(`Failed to add credit payment for credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const closeCreditSale = async (shop, id, paymentData = null) => {
  try {
    const updateData = { status: 'Cleared' };
    if (paymentData) {
      updateData.payment = paymentData;
    }
    const data = await request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`, updateData);
    return data;
  } catch (error) {
    throw new Error(`Failed to close credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const addCreditRefund = async (shop, id, refundData) => {
  try {
    const data = await request('POST', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/refund`, refundData);
    return data;
  } catch (error) {
    throw new Error(`Failed to add credit refund for credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const updateCreditPayment = async (shop, id, paymentId, paymentData) => {
  try {
    const data = await request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/payment/${encodeURIComponent(paymentId)}`, paymentData);
    return data;
  } catch (error) {
    throw new Error(`Failed to update credit payment ${paymentId} for credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const deleteCreditPayment = async (shop, id, paymentId) => {
  try {
    const data = await request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/payment/${encodeURIComponent(paymentId)}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to delete credit payment ${paymentId} for credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const deleteCreditSale = async (shop, id) => {
  try {
    const data = await request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}`);
    return data;
  } catch (error) {
    throw new Error(`Failed to delete credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const restoreCreditSale = async (shop, id) => {
  try {
    const data = await request('PUT', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/restore`);
    return data;
  } catch (error) {
    throw new Error(`Failed to restore credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const permanentDeleteCreditSale = async (shop, id) => {
  try {
    const data = await request('DELETE', `/${encodeURIComponent(shop)}/credits/${encodeURIComponent(id)}/permanent`);
    return data;
  } catch (error) {
    throw new Error(`Failed to permanently delete credit sale ${id} in ${shop}: ${error.message}`);
  }
};

export const fetchDeletedCreditSales = async (shop) => {
  try {
    const data = await request('GET', `/${encodeURIComponent(shop)}/credits/deleted`);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch deleted credit sales for ${shop}: ${error.message}`);
  }
};

export const processReturn = async (shop, returnData) => {
  try {
    const data = await request('POST', `/${encodeURIComponent(shop)}/returns`, returnData);
    return data;
  } catch (error) {
    throw new Error(`Failed to process return for ${shop}: ${error.message}`);
  }
};