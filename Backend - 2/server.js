const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/construction', {
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
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Open', 'Cleared'], default: 'Open' },
  lastTransactionDate: { type: String, required: true }, // YYYY-MM-DD
  shop: { type: String, required: true },
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

// Stock Routes
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
    const { name, category, unit } = req.body;
    const Stock = getStockModel(shop);
    await Stock.deleteMany({ name, category, unit });
    res.json({ message: 'Items deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sales Routes
app.post('/api/:shop/sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { profileName, phoneNumber, paymentMethod, items, date } = req.body;
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

    // Generate bill number
    const billNo = await getNextBillNumber(shop);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Initialize bill
    let advanceRemaining = null;
    let finalPaymentMethod = paymentMethod;

    // Find or create customer
    let customer = await Customer.findOne({ phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === profileName && !p.deleteuser.value);
      if (profile && paymentMethod === 'Advance' && profile.advance?.value) {
        finalPaymentMethod = profile.advance.paymentMethod || 'Cash';
      } else if (profile) {
        finalPaymentMethod = profile.paymentMethod || paymentMethod;
      }
    }

    const bill = { billNo, date, items, totalAmount, paymentMethod: finalPaymentMethod, shop };

    // Handle customer and profile
    if (!customer) {
      customer = new Customer({
        phoneNumber,
        profiles: [{
          profileId: uuidv4(),
          name: profileName,
          advance: { value: false, currentamount: 0, paymentMethod: finalPaymentMethod, showinadvance: false },
          advanceHistory: [],
          credit: paymentMethod === 'Credit' ? totalAmount : 0,
          paymentMethod: finalPaymentMethod,
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
          advance: { value: false, currentamount: 0, paymentMethod: finalPaymentMethod, showinadvance: false },
          advanceHistory: [],
          credit: paymentMethod === 'Credit' ? totalAmount : 0,
          paymentMethod: finalPaymentMethod,
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
          profile.advance.paymentMethod = finalPaymentMethod;
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
          paymentMethod: p.advance?.paymentMethod || p.paymentMethod || 'Cash',
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
      // Fetch category from existing stock if item.category is missing
      let category = item.category;
      if (!category) {
        const stockItem = await Stock.findOne({ name: item.product, unit: item.unit });
        category = stockItem ? stockItem.category : 'Unknown'; // Default to 'Unknown' if no stock found
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
          category, // Use resolved category
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
// Expense Routes
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

// Customer Routes
app.get('/api/:shop/customers', async (req, res) => {
  try {
    const { shop } = req.params;
    const { search, deleted } = req.query;
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
    const customers = await Customer.find(query);
    res.json(customers);
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

// New soft delete route for customer profiles
app.put('/api/:shop/customers/:phoneNumber/profiles/:profileId/softdelete', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const Customer = getCustomerModel(shop);
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
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

// Advance Payment Routes
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

// Credit Sales Routes
app.get('/api/:shop/credits', async (req, res) => {
  try {
    const { shop } = req.params;
    const CreditSale = getCreditSaleModel(shop);
    const creditSales = await CreditSale.find();
    res.json(creditSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:shop/credits', async (req, res) => {
  try {
    const { shop } = req.params;
    const { customerName, phoneNumber, items, totalAmount } = req.body;
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);

    // Validate stock
    for (const item of items) {
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product}` });
      }
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
      status: 'Open',
      lastTransactionDate: items[0].date,
      shop,
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
          advance: { value: false, currentamount: 0 },
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
          advance: { value: false, currentamount: 0 },
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
        });
      }
      await customer.save();
    }

    // Update stock
    for (const item of items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
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

    res.status(201).json({ creditSale, customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});