const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// MongoDB Connection
// mongoose.connect('mongodb+srv://mastermen1875:cluster0@cluster0.qqbsdae.mongodb.net/', {
mongoose.connect('mongodb://localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const stockSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  addedDate: { type: String, required: true }, // YYYY-MM-DD
});

const billSchema = new mongoose.Schema({
  billNo: { type: String, required: true },
  date: { type: String, required: true }, // DD-MM-YYYY
  items: [{
    product: String,
    qty: Number,
    unit: String,
    pricePerQty: Number,
    amount: Number,
    category: String,
  }],
  totalAmount: Number,
  advanceRemaining: Number,
  creditAmount: Number,
  paymentMethod: String,
  shop: String,
  otherExpenses: { type: Number, default: 0 },
});

const advanceHistorySchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['Deposit', 'Refund'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
});

const profileSchema = new mongoose.Schema({
  name: String,
  profileId: { type: String, required: true },
  advance: {
    value: Boolean,
    currentamount: Number,
    showinadvance: Boolean,
    paymentMethod: String,
  },
  paymentMethod: String,
  credit: Number,
  advanceHistory: [advanceHistorySchema],
  bills: [{
    billNo: String,
    date: String,
    items: [{
      product: String,
      qty: Number,
      unit: String,
      pricePerQty: Number,
      amount: Number,
    }],
    totalAmount: Number,
    advanceRemaining: Number,
    paymentMethod: String,
    otherExpenses: { type: Number, default: 0 },
  }],
  deleteuser: {
    value: Boolean,
    date: String,
  },
});

const customerSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  profiles: [profileSchema],
});

const expenseSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  date: { type: String, required: true }, // YYYY-MM-DD
  category: { type: String, required: true },
  expenseDescription: { type: String, default: '' },
  amount: { type: Number, required: true },
  paidTo: { type: String, required: true },
  paymentMode: { type: String, required: true },
});

const counterSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  sequence: { type: Number, default: 0 },
});

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // Can be negative for refunds
  mode: { type: String, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }, // YYYY-MM-DD
});

const creditSaleSchema = new mongoose.Schema({
  billNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  items: [{
    product: String,
    qty: Number,
    unit: String,
    pricePerUnit: Number,
    amount: Number,
    date: String, // YYYY-MM-DD
  }],
  totalAmount: { type: Number, required: true }, // Remaining balance
  paidAmount: { type: Number, default: 0 }, // Total paid
  status: { type: String, enum: ['Open', 'Cleared'], default: 'Open' },
  lastTransactionDate: { type: String, required: true }, // YYYY-MM-DD
  shop: { type: String, required: true },
  paymentHistory: [paymentHistorySchema],
  isDeleted: { type: Boolean, default: false }, // Added for soft delete
  deletedAt: { type: String, default: null }, // Date of deletion (YYYY-MM-DD)
  otherExpenses: { type: Number, default: 0 },
});

// Models
const Stock1 = mongoose.model('Stock1', stockSchema);
const Stock2 = mongoose.model('Stock2', stockSchema);
const Customer1 = mongoose.model('Customer1', customerSchema);
const Customer2 = mongoose.model('Customer2', customerSchema);
const Expense1 = mongoose.model('Expense1', expenseSchema);
const Expense2 = mongoose.model('Expense2', expenseSchema);
const Counter = mongoose.model('Counter', counterSchema);
const CreditSale1 = mongoose.model('CreditSale1', creditSaleSchema);
const CreditSale2 = mongoose.model('CreditSale2', creditSaleSchema);

// Helper Functions
const getStockModel = (shop) => (shop === 'Shop 1' ? Stock1 : Stock2);
const getCustomerModel = (shop) => (shop === 'Shop 1' ? Customer1 : Customer2);
const getExpenseModel = (shop) => (shop === 'Shop 1' ? Expense1 : Expense2);
const getCreditSaleModel = (shop) => (shop === 'Shop 1' ? CreditSale1 : CreditSale2);

const getNextBillNumber = async (shop) => {
  const counter = await Counter.findOneAndUpdate(
    { shop },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return `B${String(counter.sequence).padStart(3, '0')}`;
};

// Date Validation Helper
const validateDate = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

// Stock Routes (Unchanged)
app.get('/api/:shop/stock', async (req, res) => {
  try {
    const { shop } = req.params;
    const Stock = getStockModel(shop);
    const items = await Stock.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/stock/current', async (req, res) => {
  try {
    const { shop } = req.params;
    const { category, search } = req.query;
    const Stock = getStockModel(shop);
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await Stock.aggregate([
      { $match: query },
      {
        $group: {
          _id: { name: '$name', category: '$category', unit: '$unit' },
          quantity: { $sum: '$quantity' },
          price: { $avg: '$price' },
          id: { $first: '$id' },
        },
      },
      {
        $project: {
          id: { $concat: ['$_id.name', '-', '$_id.category', '-', '$_id.unit', '-', { $toString: new Date().getTime() }] },
          name: '$_id.name',
          category: '$_id.category',
          unit: '$_id.unit',
          quantity: 1,
          price: { $round: ['$price', 2] },
        },
      },
    ]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:shop/stock', async (req, res) => {
  try {
    const { shop } = req.params;
    const Stock = getStockModel(shop);
    const item = new Stock(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/stock/:id', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const Stock = getStockModel(shop);
    const item = await Stock.findOneAndUpdate({ id }, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/stock', async (req, res) => {
  try {
    const { shop } = req.params;
    const { id } = req.body; // Expect id in the payload
    const Stock = getStockModel(shop);
    const result = await Stock.deleteOne({ id: id }); // Delete single item by _id
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sales Routes (Unchanged)
app.post('/api/:shop/sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { profileName, phoneNumber, paymentMethod, items, date, otherExpenses = 0 } = req.body;
    console.log("Received sale data:", { profileName, phoneNumber, paymentMethod, items, date, otherExpenses }); // Debug: Log incoming data
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);
    // Validate stock
    for (const item of items) {
      const stockItems = await Stock.find({ name: item.product, category: item.category, unit: item.unit });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product}` });
      }
    }

    // Validate otherExpenses
    if (isNaN(otherExpenses) || otherExpenses < 0) {
      return res.status(400).json({ error: 'Other expenses must be a non-negative number' });
    }

    // Generate bill number
    const billNo = await getNextBillNumber(shop);
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = itemsTotal + parseFloat(otherExpenses);

    // Initialize bill
    let advanceRemaining = null;
    let finalPaymentMethod = paymentMethod;

    // Find or create customer
    let customer = await Customer.findOne({ phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === profileName && !p.deleteuser.value);
      if (profile && paymentMethod === 'Advance' && profile.advance?.value) {
        finalPaymentMethod = 'Advance';
      } else if (profile) {
        finalPaymentMethod = profile.paymentMethod || paymentMethod;
      }
    }

    const bill = { billNo, date, items, totalAmount, paymentMethod: finalPaymentMethod, shop, otherExpenses: parseFloat(otherExpenses || 0) };
    console.log("Constructed bill:", bill); // Debug: Log bill before saving

    // Handle customer and profile
    if (!customer) {
      customer = new Customer({
        phoneNumber,
        profiles: [{
          profileId: uuidv4(),
          name: profileName,
          advance: {
            value: paymentMethod === 'Advance',
            currentamount: 0,
            paymentMethod: paymentMethod === 'Advance' ? 'Cash' : '',
            showinadvance: paymentMethod === 'Advance',
          },
          advanceHistory: [],
          credit: paymentMethod === 'Credit' ? totalAmount : 0,
          paymentMethod: paymentMethod === 'Advance' ? '' : finalPaymentMethod,
          bills: [
            paymentMethod === 'Credit'
              ? { ...bill, creditAmount: totalAmount }
              : paymentMethod === 'Advance'
                ? { ...bill, advanceRemaining }
                : bill
          ],
          deleteuser: { value: false, date: '' },
        }],
      });
      await customer.save();
    } else {
      let profile = customer.profiles.find(p => p.name === profileName && !p.deleteuser.value);
      if (!profile) {
        profile = {
          profileId: uuidv4(),
          name: profileName,
          advance: {
            value: paymentMethod === 'Advance',
            currentamount: 0,
            paymentMethod: paymentMethod === 'Advance' ? 'Cash' : '',
            showinadvance: paymentMethod === 'Advance',
          },
          advanceHistory: [],
          credit: paymentMethod === 'Credit' ? totalAmount : 0,
          paymentMethod: paymentMethod === 'Advance' ? '' : finalPaymentMethod,
          bills: [
            paymentMethod === 'Credit'
              ? { ...bill, creditAmount: totalAmount }
              : paymentMethod === 'Advance'
                ? { ...bill, advanceRemaining }
                : bill
          ],
          deleteuser: { value: false, date: '' },
        };
        customer.profiles.push(profile);
      } else {
        if (paymentMethod === 'Advance') {
          if (!profile.advance.value) {
            throw new Error('Profile does not have advance enabled');
          }
          const newBalance = profile.advance.currentamount - totalAmount;
          if (newBalance < 0) {
            throw new Error('Insufficient advance balance');
          }
          profile.advance.currentamount = newBalance;
          advanceRemaining = newBalance;
          bill.advanceRemaining = newBalance;
        } else if (paymentMethod === 'Credit') {
          profile.credit = (profile.credit || 0) + totalAmount;
          profile.paymentMethod = finalPaymentMethod;
          bill.creditAmount = totalAmount;
        }
        profile.bills.push(
          paymentMethod === 'Advance'
            ? { ...bill, advanceRemaining }
            : paymentMethod === 'Credit'
              ? { ...bill, creditAmount: totalAmount }
              : bill
        );
      }
      await customer.save();
    }

    // Update stock
    for (const item of items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, category: item.category, unit: item.unit });
      for (const stockItem of stockItems) {
        if (qtyToDeduct <= 0) break;
        const deduct = Math.min(qtyToDeduct, stockItem.quantity);
        stockItem.quantity -= deduct;
        qtyToDeduct -= deduct;
        if (stockItem.quantity === 0) {
          await Stock.deleteOne({ _id: stockItem._id });
        } else {
          await stockItem.save();
        }
      }
    }

    console.log("Saved customer with bill:", customer.profiles.find(p => p.name === profileName).bills); // Debug: Log saved bills
    res.status(201).json({ bill, customer });
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/:shop/next-bill-number', async (req, res) => {
  try {
    const { shop } = req.params;
    const counter = await Counter.findOne({ shop });
    const sequence = counter ? counter.sequence + 1 : 1;
    res.json({ billNo: `B${String(sequence).padStart(3, '0')}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { date, search } = req.query;
    const Customer = getCustomerModel(shop);
    const customers = await Customer.find();
    let sales = customers
      .flatMap(c => c.profiles
        .filter(p => !p.deleteuser.value)
        .flatMap(p => p.bills.map(b => ({
          ...b._doc,
          profileName: p.name,
          phoneNumber: c.phoneNumber,
          paymentMethod: b.paymentMethod || 'Cash',
          profileId: p.profileId,
        }))))
      .filter(s => !date || s.date === date)
      .filter(s => !search || s.profileName.toLowerCase().includes(search.toLowerCase()) || s.phoneNumber.includes(search));

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:shop/sales/:billNo', async (req, res) => {
  try {
    const { shop, billNo } = req.params;
    const { profileId, phoneNumber, items } = req.body;
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);

    // Validate input
    if (!profileId || !phoneNumber || !items) {
      return res.status(400).json({ error: 'profileId, phoneNumber, and items are required' });
    }

    // Find customer
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Find profile
    const profile = customer.profiles.find(p => p.profileId === profileId && !p.deleteuser.value);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or deleted' });
    }

    // Find bill
    const billIndex = profile.bills.findIndex(b => b.billNo === billNo);
    if (billIndex === -1) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    const bill = profile.bills[billIndex];

    // Restore stock
    for (const item of items) {
      let category = item.category;
      if (!category) {
        const stockItem = await Stock.findOne({ name: item.product, unit: item.unit });
        category = stockItem ? stockItem.category : 'Unknown';
      }

      const stockItems = await Stock.find({ name: item.product, category, unit: item.unit });
      let qtyToRestore = item.qty;
      if (stockItems.length > 0) {
        for (const stockItem of stockItems) {
          if (qtyToRestore <= 0) break;
          stockItem.quantity += qtyToRestore;
          qtyToRestore = 0;
          await stockItem.save();
        }
      }
      if (qtyToRestore > 0) {
        const newStock = new Stock({
          id: uuidv4(),
          name: item.product,
          quantity: qtyToRestore,
          unit: item.unit,
          category,
          price: item.pricePerQty,
          addedDate: new Date().toISOString().split('T')[0],
        });
        await newStock.save();
      }
    }

    // Update advance and credit
    let advanceRestored = 0;
    if (bill.paymentMethod === 'Advance' && bill.advanceRemaining !== undefined) {
      advanceRestored = bill.totalAmount;
      profile.advance.currentamount += advanceRestored;
    }
    if (bill.creditAmount) {
      profile.credit = (profile.credit || 0) - bill.creditAmount;
    }

    // Remove bill
    profile.bills.splice(billIndex, 1);

    // Update advanceRemaining for subsequent bills
    let currentAdvance = profile.advance.currentamount;
    for (let i = 0; i < profile.bills.length; i++) {
      const b = profile.bills[i];
      if (b.paymentMethod === 'Advance') {
        currentAdvance -= b.totalAmount;
        if (currentAdvance < 0) {
          throw new Error(`Insufficient advance balance after restoring sale ${billNo}`);
        }
        b.advanceRemaining = currentAdvance;
      }
    }

    // Save customer
    await customer.save();

    res.json({ message: 'Sale deleted successfully', updatedCustomer: customer });
  } catch (err) {
    console.error('Delete sale error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Expense Routes (Unchanged)
app.get('/api/:shop/expenses', async (req, res) => {
  try {
    const { shop } = req.params;
    const { date, paidTo } = req.query;
    const Expense = getExpenseModel(shop);
    let query = {};
    if (date) query.date = date;
    if (paidTo) query.paidTo = { $regex: paidTo, $options: 'i' };

    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:shop/expenses', async (req, res) => {
  try {
    const { shop } = req.params;
    const Expense = getExpenseModel(shop);
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/expenses/:id', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const Expense = getExpenseModel(shop);
    const expense = await Expense.findOneAndUpdate({ id }, req.body, { new: true });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/expenses/:id', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const Expense = getExpenseModel(shop);
    await Expense.deleteOne({ id });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Customer Routes (Unchanged)
app.get('/api/:shop/customers', async (req, res) => {
  try {
    const { shop } = req.params;
    const { search, deleted, page = 1, limit = 25 } = req.query;
    const Customer = getCustomerModel(shop);
    let query = {};
    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'profiles.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (deleted === 'true') {
      query['profiles.deleteuser.value'] = true;
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      customers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/customers/:phoneNumber', async (req, res) => {
  try {
    const { shop, phoneNumber } = req.params;
    const Customer = getCustomerModel(shop);
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:shop/customers', async (req, res) => {
  const shop = req.params.shop || 'unknown';
  try {
    const { phoneNumber, profiles } = req.body;
    const Customer = getCustomerModel(shop);

    // Validate input
    if (!phoneNumber || !profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ error: 'phoneNumber and profiles are required' });
    }

    // Check if customer exists
    const existingCustomer = await Customer.findOne({ phoneNumber });
    if (existingCustomer) {
      // Append new profiles to existing customer
      const newProfiles = profiles.map((profile) => ({
        ...profile,
        profileId: profile.profileId || uuidv4(),
      }));
      existingCustomer.profiles.push(...newProfiles);
      await existingCustomer.save();
      console.log(`Appended profiles to existing customer ${phoneNumber} in ${shop}:`, newProfiles);
      return res.json(existingCustomer);
    }

    // Create new customer
    const customer = new Customer({
      phoneNumber,
      profiles: profiles.map((profile) => ({
        ...profile,
        profileId: profile.profileId || uuidv4(),
      })),
    });
    await customer.save();
    console.log(`Created new customer for ${shop}:`, customer);
    res.status(201).json(customer);
  } catch (err) {
    console.error(`Error creating customer for ${shop}:`, err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/:shop/customers/:phoneNumber/profiles', async (req, res) => {
  const shop = req.params.shop || 'unknown';
  try {
    const { phoneNumber } = req.params;
    const profileData = req.body;
    const Customer = getCustomerModel(shop);

    // Validate input
    if (!profileData || !profileData.name) {
      return res.status(400).json({ error: 'Profile data and name are required' });
    }

    // Generate a unique profileId if not provided
    if (!profileData.profileId) {
      profileData.profileId = uuidv4();
    }

    // Update existing customer by pushing new profile to profiles array
    const updatedCustomer = await Customer.findOneAndUpdate(
      { phoneNumber },
      { $push: { profiles: profileData } },
      { new: true, upsert: false }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    console.log(`Appended profile to customer ${phoneNumber} in ${shop}:`, profileData);
    res.json(updatedCustomer);
  } catch (err) {
    console.error(`Error appending profile for ${shop}:`, err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/customers/:phoneNumber/profiles/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const { name, paymentMethod, advance, newPhoneNumber } = req.body;
    const Customer = getCustomerModel(shop);

    let customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.name = name || profile.name;
    if (advance) profile.advance = { ...profile.advance, ...advance };
    profile.paymentMethod = paymentMethod || profile.paymentMethod;

    if (newPhoneNumber && newPhoneNumber !== phoneNumber) {
      const existingCustomer = await Customer.findOne({ phoneNumber: newPhoneNumber });
      if (existingCustomer) {
        existingCustomer.profiles.push(profile);
        customer.profiles = customer.profiles.filter(p => p.profileId !== profileId);
        if (customer.profiles.length === 0) {
          await Customer.deleteOne({ phoneNumber });
        } else {
          await customer.save();
        }
        await existingCustomer.save();
        res.json(existingCustomer);
      } else {
        customer.phoneNumber = newPhoneNumber;
        await customer.save();
        res.json(customer);
      }
    } else {
      await customer.save();
      res.json(customer);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/customers/:phoneNumber/profiles/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.advance.showinadvance = false;

    await customer.save();
    res.json({ message: 'Profile hidden from advance' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/customers/:phoneNumber/profiles/:profileId/restore', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.advance.showinadvance = true;
    profile.deleteuser = { value: false, date: '' };
    await customer.save();
    res.json({ message: 'Profile restored' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/customers/:phoneNumber/profiles/:profileId/permanent', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    customer.profiles = customer.profiles.filter(p => p.profileId !== profileId);
    if (customer.profiles.length === 0) {
      await Customer.deleteOne({ phoneNumber });
    } else {
      await customer.save();
    }

    res.json({ message: 'Profile permanently deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/customers/:phoneNumber/profiles/:profileId/softdelete', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.advance.showinadvance = false;
    profile.deleteuser = {
      value: true,
      date: new Date().toISOString().split('T')[0]
    };
    await customer.save();
    res.json({ message: 'Profile soft deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Advance Payment Routes (Unchanged)
app.post('/api/:shop/advance/:phoneNumber/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const { date, amount, paymentMethod } = req.body;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.advance || !profile.advance.value) {
      profile.advance = { value: true, currentamount: 0, showinadvance: true, paymentMethod };
    }

    if (amount < 0 && profile.advance.currentamount < Math.abs(amount)) {
      return res.status(400).json({ error: 'Refund amount exceeds current advance balance' });
    }

    const transactionType = amount >= 0 ? 'Deposit' : 'Refund';
    const newBalance = profile.advance.currentamount + amount;

    await Customer.updateOne(
      { phoneNumber, 'profiles.profileId': profileId },
      {
        $set: {
          'profiles.$.advance.currentamount': newBalance,
          'profiles.$.advance.paymentMethod': paymentMethod,
          'profiles.$.advance.value': true,
          'profiles.$.advance.showinadvance': true,
        },
        $push: {
          'profiles.$.advanceHistory': {
            transactionType,
            amount: Math.abs(amount),
            date: date || new Date().toISOString().split('T')[0],
          },
        },
      }
    );

    const updatedCustomer = await Customer.findOne({ phoneNumber });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/:shop/advance/:phoneNumber/profiles/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const { name, paymentMethod } = req.body;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.name = name || profile.name;
    profile.advance.paymentMethod = paymentMethod || profile.advance.paymentMethod;

    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/advance/:phoneNumber/profiles/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.advance.showinadvance = false;

    await customer.save();
    res.json({ message: 'Profile hidden from advance' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Credit Sales Routes (Updated)
app.get('/api/:shop/credits', async (req, res) => {
  try {
    const { shop } = req.params;
    const { page = 1, limit = 10, sortBy = 'lastTransactionDate', sortOrder = 'desc', search, showDeleted = 'false' } = req.query;
    const CreditSale = getCreditSaleModel(shop);

    const query = { isDeleted: showDeleted === 'true' };
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await CreditSale.countDocuments(query);
    const creditSales = await CreditSale.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      data: creditSales,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Fetch credit sales error:', err);
    res.status(500).json({ error: 'Failed to fetch credit sales: ' + err.message });
  }
});

app.post('/api/:shop/credits', async (req, res) => {
  try {
    const { shop } = req.params;
    const { customerName, phoneNumber, items, totalAmount, otherExpenses = 0 } = req.body;
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);

    // Validate input
    if (!customerName || !phoneNumber || !items || !Array.isArray(items) || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (isNaN(otherExpenses) || otherExpenses < 0) {
      return res.status(400).json({ error: 'Other expenses must be a non-negative number' });
    }

    // Validate items and dates
    for (const item of items) {
      if (!item.product || !item.qty || !item.unit || !item.pricePerUnit || !item.amount || !item.date) {
        return res.status(400).json({ error: `Invalid item data for ${item.product || 'item'}` });
      }
      if (!validateDate(item.date)) {
        return res.status(400).json({ error: `Invalid date for item ${item.product}: ${item.date}` });
      }
    }

    // Validate stock
    for (const item of items) {
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product} (${item.unit})` });
      }
    }

    // Verify totalAmount
    const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0) + parseFloat(otherExpenses);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ error: 'Total amount does not match item amounts plus other expenses' });
    }

    // Generate bill number
    const billNumber = await getNextBillNumber(shop);

    // Create credit sale
    const creditSale = new CreditSale({
      billNumber,
      customerName,
      phoneNumber,
      items,
      totalAmount,
      paidAmount: 0,
      status: 'Open',
      lastTransactionDate: items[0].date,
      shop,
      paymentHistory: [],
      isDeleted: false,
      deletedAt: null,
      otherExpenses: parseFloat(otherExpenses),
    });
    await creditSale.save();

    // Update customer profile
    let customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      customer = new Customer({
        phoneNumber,
        profiles: [{
          profileId: uuidv4(),
          name: customerName,
          advance: { value: false, currentamount: 0, showinadvance: false },
          advanceHistory: [],
          credit: totalAmount,
          paymentMethod: 'Credit',
          bills: [{
            billNo: billNumber,
            date: items[0].date,
            items: items.map(item => ({
              product: item.product,
              qty: item.qty,
              unit: item.unit,
              pricePerQty: item.pricePerUnit,
              amount: item.amount,
            })),
            totalAmount,
            creditAmount: totalAmount,
            paymentMethod: 'Credit',
            shop,
            otherExpenses: parseFloat(otherExpenses),
          }],
          deleteuser: { value: false, date: '' },
        }],
      });
      await customer.save();
    } else {
      let profile = customer.profiles.find(p => p.name === customerName && !p.deleteuser.value);
      if (!profile) {
        profile = {
          profileId: uuidv4(),
          name: customerName,
          advance: { value: false, currentamount: 0, showinadvance: false },
          advanceHistory: [],
          credit: totalAmount,
          paymentMethod: 'Credit',
          bills: [{
            billNo: billNumber,
            date: items[0].date,
            items: items.map(item => ({
              product: item.product,
              qty: item.qty,
              unit: item.unit,
              pricePerQty: item.pricePerUnit,
              amount: item.amount,
            })),
            totalAmount,
            creditAmount: totalAmount,
            paymentMethod: 'Credit',
            shop,
            otherExpenses: parseFloat(otherExpenses),
          }],
          deleteuser: { value: false, date: '' },
        };
        customer.profiles.push(profile);
      } else {
        profile.credit = (profile.credit || 0) + totalAmount;
        profile.paymentMethod = 'Credit';
        profile.bills.push({
          billNo: billNumber,
          date: items[0].date,
          items: items.map(item => ({
            product: item.product,
            qty: item.qty,
            unit: item.unit,
            pricePerQty: item.pricePerUnit,
            amount: item.amount,
          })),
          totalAmount,
          creditAmount: totalAmount,
          paymentMethod: 'Credit',
          shop,
          otherExpenses: parseFloat(otherExpenses),
        });
      }
      await customer.save();
    }

    // Update stock
    for (const item of items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, unit: item.unit }).sort({ addedDate: 1 });
      for (const stockItem of stockItems) {
        if (qtyToDeduct <= 0) break;
        const deduct = Math.min(qtyToDeduct, stockItem.quantity);
        stockItem.quantity -= deduct;
        qtyToDeduct -= deduct;
        if (stockItem.quantity === 0) {
          await Stock.deleteOne({ _id: stockItem._id });
        } else {
          await stockItem.save();
        }
      }
      if (qtyToDeduct > 0) {
        throw new Error(`Failed to deduct stock for ${item.product} (${item.unit})`);
      }
    }

    res.status(201).json({ creditSale, customer });
  } catch (err) {
    console.error('Create credit sale error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/credits/:id', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const { status, payment } = req.body;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is deleted' });

    const currentDate = new Date().toISOString().split('T')[0];

    // Validate payment date
    if (payment && payment.date && !validateDate(payment.date)) {
      return res.status(400).json({ error: `Invalid payment date: ${payment.date}` });
    }

    // Handle partial payment
    if (payment && payment.amount >= 0) {
      if (payment.amount > creditSale.totalAmount) {
        return res.status(400).json({ error: 'Payment amount exceeds remaining balance' });
      }
      creditSale.paidAmount += payment.amount;
      creditSale.totalAmount -= payment.amount;
      creditSale.lastTransactionDate = payment.date || currentDate;
      creditSale.paymentHistory.push({
        amount: payment.amount,
        mode: payment.mode || 'Cash',
        note: payment.note || '',
        date: payment.date || currentDate,
      });
      if (creditSale.totalAmount <= 0) {
        creditSale.status = 'Cleared';
        creditSale.totalAmount = 0;
      }
    }

    // Handle status update
    if (status) {
      if (status === 'Cleared' && payment && payment.mode === 'Manual') {
        // Manual settlement
        if (!payment.amount || payment.amount < 0) {
          return res.status(400).json({ error: 'Invalid settlement amount' });
        }
        creditSale.paidAmount = creditSale.paidAmount + payment.amount;
        creditSale.totalAmount = 0;
        creditSale.status = 'Cleared';
        creditSale.lastTransactionDate = payment.date || currentDate;
        creditSale.paymentHistory.push({
          amount: payment.amount,
          mode: 'Manual',
          note: payment.note || 'Manual settlement',
          date: payment.date || currentDate,
        });
      } else if (status === 'Cleared') {
        // Full payment close
        const remaining = creditSale.totalAmount;
        creditSale.paidAmount += remaining;
        creditSale.totalAmount = 0;
        creditSale.status = 'Cleared';
        creditSale.lastTransactionDate = payment?.date || currentDate;
        if (payment) {
          creditSale.paymentHistory.push({
            amount: payment.amount || remaining,
            mode: payment.mode || 'Cash',
            note: payment.note || 'Full payment',
            date: payment.date || currentDate,
          });
        }
      }
    }

    await creditSale.save();

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const bill = profile.bills.find(b => b.billNo === creditSale.billNumber);
        if (bill) {
          bill.creditAmount = creditSale.totalAmount;
          bill.totalAmount = creditSale.totalAmount;
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
          await customer.save();
        }
      }
    }

    res.json(creditSale);
  } catch (err) {
    console.error('Update credit sale error:', err);
    res.status(400).json({ error: 'Failed to update credit sale: ' + err.message });
  }
});

app.post('/api/:shop/credits/:id/refund', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const { amount, note, date } = req.body;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is deleted' });

    // Validate refund
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Refund amount must be positive' });
    }
    if (amount > creditSale.paidAmount) {
      return res.status(400).json({ error: 'Refund amount exceeds paid amount' });
    }
    if (!date || !validateDate(date)) {
      return res.status(400).json({ error: `Invalid refund date: ${date}` });
    }

    // Process refund
    creditSale.paidAmount -= amount;
    creditSale.totalAmount += amount;
    creditSale.lastTransactionDate = date;
    creditSale.paymentHistory.push({
      amount: -amount,
      mode: 'Refund',
      note: note || 'Customer refund',
      date,
    });

    // Reopen bill if necessary
    if (creditSale.status === 'Cleared' && creditSale.totalAmount > 0) {
      creditSale.status = 'Open';
    }

    await creditSale.save();

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const bill = profile.bills.find(b => b.billNo === creditSale.billNumber);
        if (bill) {
          bill.creditAmount = creditSale.totalAmount;
          bill.totalAmount = creditSale.totalAmount;
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
          await customer.save();
        }
      }
    }

    res.json(creditSale);
  } catch (err) {
    console.error('Credit refund error:', err);
    res.status(400).json({ error: 'Failed to process refund: ' + err.message });
  }
});

app.put('/api/:shop/credits/:id/payment/:paymentId', async (req, res) => {
  try {
    const { shop, id, paymentId } = req.params;
    const { amount, mode, note, date } = req.body;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is deleted' });

    const payment = creditSale.paymentHistory.id(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Validate updated amount and date
    if (!amount || amount < 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    if (!date || !validateDate(date)) {
      return res.status(400).json({ error: `Invalid payment date: ${date}` });
    }
    const maxPayment = creditSale.totalAmount + (payment.amount >= 0 ? payment.amount : 0);
    if (amount > maxPayment) {
      return res.status(400).json({ error: 'Updated payment amount exceeds remaining balance' });
    }

    // Adjust paidAmount and totalAmount
    if (payment.amount >= 0) {
      // Original was a payment
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
      creditSale.paidAmount += amount;
      creditSale.totalAmount -= amount;
    } else {
      // Original was a refund
      creditSale.paidAmount -= payment.amount; // Undo refund
      creditSale.totalAmount += payment.amount;
      creditSale.paidAmount -= amount;
      creditSale.totalAmount += amount;
    }

    // Update payment entry
    payment.amount = amount;
    payment.mode = mode || payment.mode;
    payment.note = note || payment.note;
    payment.date = date;

    // Update status
    if (creditSale.totalAmount <= 0) {
      creditSale.status = 'Cleared';
      creditSale.totalAmount = 0;
    } else {
      creditSale.status = 'Open';
    }
    creditSale.lastTransactionDate = date;

    await creditSale.save();

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const bill = profile.bills.find(b => b.billNo === creditSale.billNumber);
        if (bill) {
          bill.creditAmount = creditSale.totalAmount;
          bill.totalAmount = creditSale.totalAmount;
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
          await customer.save();
        }
      }
    }

    res.json(creditSale);
  } catch (err) {
    console.error('Update credit payment error:', err);
    res.status(400).json({ error: 'Failed to update payment: ' + err.message });
  }
});

app.delete('/api/:shop/credits/:id/payment/:paymentId', async (req, res) => {
  try {
    const { shop, id, paymentId } = req.params;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is deleted' });

    const payment = creditSale.paymentHistory.id(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const currentDate = new Date().toISOString().split('T')[0];

    // Adjust paidAmount and totalAmount
    if (payment.amount >= 0) {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
    } else {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
    }

    // Remove payment entry
    creditSale.paymentHistory.pull(paymentId);

    // Update status
    if (creditSale.totalAmount <= 0) {
      creditSale.status = 'Cleared';
      creditSale.totalAmount = 0;
    } else {
      creditSale.status = 'Open';
    }
    creditSale.lastTransactionDate = creditSale.paymentHistory.length > 0
      ? creditSale.paymentHistory[creditSale.paymentHistory.length - 1].date
      : creditSale.items[0].date;

    await creditSale.save();

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const bill = profile.bills.find(b => b.billNo === creditSale.billNumber);
        if (bill) {
          bill.creditAmount = creditSale.totalAmount;
          bill.totalAmount = creditSale.totalAmount;
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
          await customer.save();
        }
      }
    }

    res.json(creditSale);
  } catch (err) {
    console.error('Delete credit payment error:', err);
    res.status(400).json({ error: 'Failed to delete payment: ' + err.message });
  }
});

app.delete('/api/:shop/credits/:id', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);
    const Stock = getStockModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is already deleted' });

    // Mark as soft deleted
    creditSale.isDeleted = true;
    creditSale.deletedAt = new Date().toISOString().split('T')[0];
    await creditSale.save();

    // Restore stock
    for (const item of creditSale.items) {
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
      let qtyToRestore = item.qty;
      if (stockItems.length > 0) {
        for (const stockItem of stockItems) {
          if (qtyToRestore <= 0) break;
          stockItem.quantity += qtyToRestore;
          qtyToRestore = 0;
          await stockItem.save();
        }
      }
      if (qtyToRestore > 0) {
        const newStock = new Stock({
          id: uuidv4(),
          name: item.product,
          quantity: qtyToRestore,
          unit: item.unit,
          category: 'Unknown', // Default since category is missing
          price: item.pricePerUnit,
          addedDate: new Date().toISOString().split('T')[0],
        });
        await newStock.save();
      }
    }

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const billIndex = profile.bills.findIndex(b => b.billNo === creditSale.billNumber);
        if (billIndex !== -1) {
          profile.bills.splice(billIndex, 1);
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
          await customer.save();
        }
      }
    }

    res.json({ message: 'Credit sale soft deleted successfully' });
  } catch (err) {
    console.error('Delete credit sale error:', err);
    res.status(400).json({ error: 'Failed to delete credit sale: ' + err.message });
  }
});

app.put('/api/:shop/credits/:id/restore', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);
    const Stock = getStockModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (!creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale is not deleted' });

    // Validate stock before restoring
    for (const item of creditSale.items) {
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock to restore ${item.product} (${item.unit})` });
      }
    }

    // Deduct stock
    for (const item of creditSale.items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, unit: item.unit }).sort({ addedDate: 1 });
      for (const stockItem of stockItems) {
        if (qtyToDeduct <= 0) break;
        const deduct = Math.min(qtyToDeduct, stockItem.quantity);
        stockItem.quantity -= deduct;
        qtyToDeduct -= deduct;
        if (stockItem.quantity === 0) {
          await Stock.deleteOne({ _id: stockItem._id });
        } else {
          await stockItem.save();
        }
      }
    }

    // Restore credit sale
    creditSale.isDeleted = false;
    creditSale.deletedAt = null;
    await creditSale.save();

    // Update customer profile
    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        profile.bills.push({
          billNo: creditSale.billNumber,
          date: creditSale.items[0].date,
          items: creditSale.items.map(item => ({
            product: item.product,
            qty: item.qty,
            unit: item.unit,
            pricePerQty: item.pricePerUnit,
            amount: item.amount,
          })),
          totalAmount: creditSale.totalAmount,
          creditAmount: creditSale.totalAmount,
          paymentMethod: 'Credit',
          shop,
        });
        profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);
        await customer.save();
      }
    }

    res.json({ message: 'Credit sale restored successfully', creditSale });
  } catch (err) {
    console.error('Restore credit sale error:', err);
    res.status(400).json({ error: 'Failed to restore credit sale: ' + err.message });
  }
});

app.delete('/api/:shop/credits/:id/permanent', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const CreditSale = getCreditSaleModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });
    if (!creditSale.isDeleted) return res.status(400).json({ error: 'Credit sale must be soft deleted first' });

    // Permanently delete
    await CreditSale.deleteOne({ _id: id });

    res.json({ message: 'Credit sale permanently deleted' });
  } catch (err) {
    console.error('Permanent delete credit sale error:', err);
    res.status(400).json({ error: 'Failed to permanently delete credit sale: ' + err.message });
  }
});

app.get('/api/:shop/credits/deleted', async (req, res) => {
  try {
    const { shop } = req.params;
    const CreditSale = getCreditSaleModel(shop);

    const deletedCreditSales = await CreditSale.find({ isDeleted: true }).lean();

    // Auto-delete entries older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    await CreditSale.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgoStr },
    });

    res.json({ data: deletedCreditSales });
  } catch (err) {
    console.error('Fetch deleted credit sales error:', err);
    res.status(500).json({ error: 'Failed to fetch deleted credit sales: ' + err.message });
  }
});

// Dashboard Routes (Updated)
app.get('/api/:shop/low-stock', async (req, res) => {
  try {
    const { shop } = req.params;
    const Stock = getStockModel(shop);
    const items = await Stock.aggregate([
      {
        $group: {
          _id: { name: '$name', unit: '$unit' },
          stock: { $sum: '$quantity' },
          unit: { $first: '$unit' },
        },
      },
      { $match: { stock: { $lt: 10 } } },
      {
        $project: {
          product: '$_id.name',
          stock: 1,
          unit: 1,
        },
      },
      { $sort: { stock: 1 } },
    ]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/recent-sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const Customer = getCustomerModel(shop);
    const customers = await Customer.find();
    const sales = customers
      .flatMap(c => c.profiles
        .filter(p => !p.deleteuser.value)
        .flatMap(p => p.bills.map(b => ({
          id: b.billNo,
          customer: p.name,
          product: b.items[0]?.product || 'Unknown',
          amount: b.totalAmount,
          date: b.date,
          status: b.paymentType === 'Credit' ? (b.creditAmount > 0 ? 'Credit' : 'Cleared') : 'Paid',
          shop: b.shop,
        }))))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/recent-purchases', async (req, res) => {
  try {
    const { shop } = req.params;
    const Stock = getStockModel(shop);
    const purchases = await Stock.find()
      .sort({ addedDate: -1 })
      .limit(5)
      .select('name quantity price addedDate')
      .lean();
    const formattedPurchases = purchases.map(p => ({
      id: p.id,
      product: p.name,
      amount: p.quantity * p.price,
      customer: 'Stock Supplier',
      date: p.addedDate,
    }));
    res.json(formattedPurchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/profit-trend', async (req, res) => {
  try {
    const { shop } = req.params;
    const Customer = getCustomerModel(shop);
    const Expense = getExpenseModel(shop);
    const months = 4;
    const profitData = [];

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const customers = await Customer.find();
      const salesRevenue = customers
        .flatMap(c => c.profiles.flatMap(p => p.bills))
        .filter(b => b.date >= monthStart && b.date <= monthEnd)
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const expenses = await Expense.find({
        date: { $gte: monthStart, $lte: monthEnd },
      });
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      profitData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        profit: salesRevenue - totalExpenses,
      });
    }

    res.json(profitData.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/summary', async (req, res) => {
  try {
    const { shop } = req.params;
    const { date } = req.query; // Optional date filter (YYYY-MM-DD)
    const Customer = getCustomerModel(shop);
    const customers = await Customer.find();

    const sales = customers
      .flatMap(c => c.profiles
        .filter(p => !p.deleteuser.value)
        .flatMap(p => p.bills.map(b => ({
          ...b,
          profileName: p.name,
          phoneNumber: c.phoneNumber,
          paymentMethod: b.paymentMethod || p.advance?.paymentMethod || p.paymentMethod || 'Cash',
        }))))
      .filter(b => !date || b.date === date);

    const totalSales = sales.reduce((sum, b) => sum + b.totalAmount, 0);
    const users = new Set(customers.flatMap(c => c.profiles.map(p => p.name))).size;
    const creditSales = sales
      .filter(b => b.paymentMethod === 'Credit' && b.creditAmount > 0)
      .reduce((sum, b) => sum + b.creditAmount, 0);
    const advancePayments = customers
      .flatMap(c => c.profiles)
      .reduce((sum, p) => sum + (p.advance?.currentamount || 0), 0);

    // Sales by payment method
    const salesByPaymentMethod = {
      Cash: sales
        .filter(b => b.paymentMethod === 'Cash')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      Online: sales
        .filter(b => b.paymentMethod === 'Online')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      Advance: sales
        .filter(b => b.paymentMethod === 'Advance')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      Credit: sales
        .filter(b => b.paymentMethod === 'Credit')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      Cheque: sales
        .filter(b => b.paymentMethod === 'Cheque')
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };

    res.json({
      totalSales,
      users,
      creditSales,
      advancePayments,
      salesByPaymentMethod,
    });
  } catch (err) {
    console.error('Fetch summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary: ' + err.message });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const { date } = req.query; // Optional date filter (YYYY-MM-DD)
    const shops = ['Shop 1', 'Shop 2'];
    let totalSales = 0;
    let users = new Set();
    let creditSales = 0;
    let advancePayments = 0;
    const salesByPaymentMethod = {
      Cash: 0,
      Online: 0,
      Advance: 0,
      Credit: 0,
      Cheque: 0,
    };

    for (const shop of shops) {
      const Customer = getCustomerModel(shop);
      const customers = await Customer.find();

      const sales = customers
        .flatMap(c => c.profiles
          .filter(p => !p.deleteuser.value)
          .flatMap(p => p.bills.map(b => ({
            ...b,
            profileName: p.name,
            phoneNumber: c.phoneNumber,
            paymentMethod: b.paymentMethod || p.advance?.paymentMethod || p.paymentMethod || 'Cash',
          }))))
        .filter(b => !date || b.date === date);

      totalSales += sales.reduce((sum, b) => sum + b.totalAmount, 0);
      customers.flatMap(c => c.profiles.map(p => p.name)).forEach(name => users.add(name));
      creditSales += sales
        .filter(b => b.paymentMethod === 'Credit' && b.creditAmount > 0)
        .reduce((sum, b) => sum + b.creditAmount, 0);
      advancePayments += customers
        .flatMap(c => c.profiles)
        .reduce((sum, p) => sum + (p.advance?.currentamount || 0), 0);

      // Aggregate sales by payment method
      salesByPaymentMethod.Cash += sales
        .filter(b => b.paymentMethod === 'Cash')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      salesByPaymentMethod.Online += sales
        .filter(b => b.paymentMethod === 'Online')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      salesByPaymentMethod.Advance += sales
        .filter(b => b.paymentMethod === 'Advance')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      salesByPaymentMethod.Credit += sales
        .filter(b => b.paymentMethod === 'Credit')
        .reduce((sum, b) => sum + b.totalAmount, 0);
      salesByPaymentMethod.Cheque += sales
        .filter(b => b.paymentMethod === 'Cheque')
        .reduce((sum, b) => sum + b.totalAmount, 0);
    }

    res.json({
      totalSales,
      users: users.size,
      creditSales,
      advancePayments,
      salesByPaymentMethod,
    });
  } catch (err) {
    console.error('Fetch combined summary error:', err);
    res.status(500).json({ error: 'Failed to fetch combined summary: ' + err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});