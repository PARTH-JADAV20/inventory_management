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
mongoose.connect('mongodb+srv://mastermen1875:cluster0@cluster0.qqbsdae.mongodb.net/', {
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
  paymentType: String,
  shop: String,
});

const advanceHistorySchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['Deposit', 'Refund'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
});

const profileSchema = new mongoose.Schema({
  profileId: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  advance: {
    value: { type: Boolean, default: false },
    currentamount: { type: Number, default: 0 },
    showinadvance: { type: Boolean, default: true },
    paymentType: String,
  },
  advanceHistory: [advanceHistorySchema],
  credit: { type: Number, default: 0 },
  paymentType: String,
  bills: [billSchema],
  deleteuser: {
    value: { type: Boolean, default: false },
    date: { type: String, default: '' },
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
  paymentHistory: [paymentHistorySchema], // Store payments and refunds
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
    const { name, category, unit } = req.body;
    const Stock = getStockModel(shop);
    await Stock.deleteMany({ name, category, unit });
    res.json({ message: 'Items deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sales Routes (Unchanged)
app.post('/api/:shop/sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { profileName, phoneNumber, paymentType, items, date } = req.body;
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

    const bill = { billNo, date, items, totalAmount, paymentType, shop };

    // Handle customer and profile
    let customer = await Customer.findOne({ phoneNumber });

    if (!customer) {
      customer = new Customer({
        phoneNumber,
        profiles: [{
          profileId: uuidv4(),
          name: profileName,
          advance: { value: false, currentamount: 0, paymentType },
          advanceHistory: [],
          credit: paymentType === 'Credit' ? totalAmount : 0,
          paymentType,
          bills: [paymentType === 'Credit' ? { ...bill, creditAmount: totalAmount } : bill],
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
          advance: { value: false, currentamount: 0, paymentType },
          advanceHistory: [],
          credit: paymentType === 'Credit' ? totalAmount : 0,
          paymentType,
          bills: [paymentType === 'Credit' ? { ...bill, creditAmount: totalAmount } : bill],
          deleteuser: { value: false, date: '' },
        };
        customer.profiles.push(profile);
      } else {
        if (paymentType === 'Advance') {
          if (!profile.advance.value) {
            throw new Error('Profile does not have advance enabled');
          }
          const newBalance = profile.advance.currentamount - totalAmount;
          if (newBalance < 0) {
            throw new Error('Insufficient advance balance');
          }
          profile.advance.currentamount = newBalance;
          profile.advance.paymentType = paymentType;
          bill.advanceRemaining = newBalance;
        } else if (paymentType === 'Credit') {
          profile.credit = (profile.credit || 0) + totalAmount;
          profile.paymentType = paymentType;
          bill.creditAmount = totalAmount;
        }
        profile.bills.push(bill);
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
    res.status(400).json({ error: err.message });
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
          paymentType: p.advance?.paymentType || p.paymentType || 'Cash',
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

    // Restore stock
    for (const item of items) {
      const stockItems = await Stock.find({ name: item.product, category: item.category, unit: item.unit });
      let qtyToRestore = item.qty;
      for (const stockItem of stockItems) {
        if (qtyToRestore <= 0) break;
        stockItem.quantity += qtyToRestore;
        qtyToRestore = 0;
        await stockItem.save();
      }
      if (qtyToRestore > 0) {
        const newStock = new Stock({
          id: uuidv4(),
          name: item.product,
          quantity: qtyToRestore,
          unit: item.unit,
          category: item.category,
          price: item.pricePerQty,
          addedDate: new Date().toISOString().split('T')[0],
        });
        await newStock.save();
      }
    }

    // Update customer
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) throw new Error('Customer not found');
    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) throw new Error('Profile not found');

    const bill = profile.bills.find(b => b.billNo === billNo);
    if (!bill) throw new Error('Bill not found');

    profile.bills = profile.bills.filter(b => b.billNo !== billNo);
    if (bill.creditAmount) {
      profile.credit -= bill.creditAmount;
    }
    if (bill.advanceRemaining !== undefined) {
      profile.advance.currentamount += bill.totalAmount;
    }

    await customer.save();
    res.json({ message: 'Sale deleted' });
  } catch (err) {
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
    res.json(customers.flatMap(c => c.profiles.map(p => ({
      name: p.name,
      phoneNumber: c.phoneNumber,
      profileId: p.profileId,
    }))));
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
  try {
    const { shop } = req.params;
    const Customer = getCustomerModel(shop);
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/customers/:phoneNumber/profiles/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const { name, paymentType, advance, newPhoneNumber } = req.body;
    const Customer = getCustomerModel(shop);

    let customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.name = name || profile.name;
    if (advance) profile.advance = { ...profile.advance, ...advance };
    profile.paymentType = paymentType || profile.paymentType;

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

    customer.profiles = customer.profiles.map(p =>
      p.profileId === profileId
        ? { ...p, deleteuser: { value: true, date: new Date().toISOString().split('T')[0] } }
        : p
    );

    await customer.save();
    res.json({ message: 'Profile deleted' });
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

    customer.profiles = customer.profiles.map(p =>
      p.profileId === profileId
        ? { ...p, deleteuser: { value: false, date: '' } }
        : p
    );

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

// Advance Payment Routes (Unchanged)
app.post('/api/:shop/advance/:phoneNumber/:profileId', async (req, res) => {
  try {
    const { shop, phoneNumber, profileId } = req.params;
    const { date, amount, paymentType } = req.body;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.advance || !profile.advance.value) {
      profile.advance = { value: true, currentamount: 0, showinadvance: true, paymentType };
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
          'profiles.$.advance.paymentType': paymentType,
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
    const { name, paymentType } = req.body;
    const Customer = getCustomerModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    customer.profiles = customer.profiles.map(p =>
      p.profileId === profileId
        ? { ...p, name, advance: { ...p.advance, paymentType } }
        : p
    );

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

    customer.profiles = customer.profiles.map(p =>
      p.profileId === profileId
        ? { ...p, advance: { ...p.advance, showinadvance: false } }
        : p
    );

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
    const { page = 1, limit = 10, sortBy = 'lastTransactionDate', sortOrder = 'desc', search } = req.query;
    const CreditSale = getCreditSaleModel(shop);

    const query = {};
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
      .limit(parseInt(limit));

    res.json({
      creditSales,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
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
      paidAmount: 0,
      status: 'Open',
      lastTransactionDate: items[0].date,
      shop,
      paymentHistory: [],
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
          paymentType: 'Credit',
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
            paymentType: 'Credit',
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
          paymentType: 'Credit',
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
            paymentType: 'Credit',
            shop,
          }],
          deleteuser: { value: false, date: '' },
        };
        customer.profiles.push(profile);
      } else {
        profile.credit = (profile.credit || 0) + totalAmount;
        profile.paymentType = 'Credit';
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
          paymentType: 'Credit',
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

    res.status(201).json(creditSale);
  } catch (err) {
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

    const currentDate = new Date().toISOString().split('T')[0];

    // Handle partial payment
    if (payment && payment.amount >= 0) {
      if (payment.amount > creditSale.totalAmount) {
        return res.status(400).json({ error: 'Payment amount exceeds remaining balance' });
      }
      creditSale.paidAmount += payment.amount;
      creditSale.totalAmount -= payment.amount;
      creditSale.lastTransactionDate = currentDate;
      creditSale.paymentHistory.push({
        amount: payment.amount,
        mode: payment.mode || 'Cash',
        note: payment.note || '',
        date: currentDate,
      });
      if (creditSale.totalAmount <= 0) {
        creditSale.status = 'Cleared';
        creditSale.totalAmount = 0;
      }
    }

    // Handle status update (e.g., manual settlement or full close)
    if (status) {
      if (status === 'Cleared' && payment && payment.mode === 'Manual') {
        // Manual settlement
        if (payment.amount < 0) {
          return res.status(400).json({ error: 'Invalid settlement amount' });
        }
        creditSale.paidAmount = payment.amount;
        creditSale.totalAmount = 0;
        creditSale.status = 'Cleared';
        creditSale.lastTransactionDate = currentDate;
        creditSale.paymentHistory.push({
          amount: payment.amount,
          mode: 'Manual',
          note: payment.note || '',
          date: currentDate,
        });
      } else if (status === 'Cleared') {
        // Full payment close
        creditSale.paidAmount += creditSale.totalAmount;
        creditSale.totalAmount = 0;
        creditSale.status = 'Cleared';
        creditSale.lastTransactionDate = currentDate;
        if (payment) {
          creditSale.paymentHistory.push({
            amount: payment.amount || creditSale.paidAmount,
            mode: payment.mode || 'Cash',
            note: payment.note || '',
            date: currentDate,
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
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/:shop/credits/:id/refund', async (req, res) => {
  try {
    const { shop, id } = req.params;
    const { amount, note } = req.body;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });

    // Validate refund
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Refund amount must be positive' });
    }
    if (amount > creditSale.paidAmount) {
      return res.status(400).json({ error: 'Refund amount exceeds paid amount' });
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Process refund
    creditSale.paidAmount -= amount;
    creditSale.totalAmount += amount; // Increase remaining balance
    creditSale.lastTransactionDate = currentDate;
    creditSale.paymentHistory.push({
      amount: -amount, // Negative for refund
      mode: 'Refund',
      note: note || 'Customer refund',
      date: currentDate,
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
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/:shop/credits/:id/payment/:paymentId', async (req, res) => {
  try {
    const { shop, id, paymentId } = req.params;
    const { amount, mode, note } = req.body;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });

    const payment = creditSale.paymentHistory.id(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Validate updated amount
    if (!amount || amount < 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    if (payment.amount >= 0 && amount > creditSale.totalAmount + payment.amount) {
      return res.status(400).json({ error: 'Updated payment amount exceeds remaining balance' });
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Adjust paidAmount and totalAmount
    if (payment.amount >= 0) {
      // Original was a payment
      creditSale.paidAmount -= payment.amount; // Remove old payment
      creditSale.totalAmount += payment.amount; // Restore balance
      creditSale.paidAmount += amount; // Add new payment
      creditSale.totalAmount -= amount; // Reduce balance
    } else {
      // Original was a refund
      creditSale.paidAmount -= payment.amount; // Undo refund (add back)
      creditSale.totalAmount += payment.amount; // Undo refund (reduce balance)
      creditSale.paidAmount -= amount; // Apply new refund
      creditSale.totalAmount += amount; // Increase balance
    }

    // Update payment entry
    payment.amount = amount;
    payment.mode = mode || payment.mode;
    payment.note = note || payment.note;
    payment.date = currentDate;

    // Update status
    if (creditSale.totalAmount <= 0) {
      creditSale.status = 'Cleared';
      creditSale.totalAmount = 0;
    } else {
      creditSale.status = 'Open';
    }
    creditSale.lastTransactionDate = currentDate;

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
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/:shop/credits/:id/payment/:paymentId', async (req, res) => {
  try {
    const { shop, id, paymentId } = req.params;
    const CreditSale = getCreditSaleModel(shop);
    const Customer = getCustomerModel(shop);

    const creditSale = await CreditSale.findById(id);
    if (!creditSale) return res.status(404).json({ error: 'Credit sale not found' });

    const payment = creditSale.paymentHistory.id(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const currentDate = new Date().toISOString().split('T')[0];

    // Adjust paidAmount and totalAmount
    if (payment.amount >= 0) {
      // Payment: remove it
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
    } else {
      // Refund: undo it
      creditSale.paidAmount -= payment.amount; // Add back (negative amount)
      creditSale.totalAmount += payment.amount; // Reduce balance (negative amount)
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
    creditSale.lastTransactionDate = currentDate;

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
    res.status(400).json({ error: err.message });
  }
});

// Dashboard Routes (Unchanged)
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
    const Customer = getCustomerModel(shop);
    const customers = await Customer.find();
    const totalSales = customers
      .flatMap(c => c.profiles.flatMap(p => p.bills))
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const users = new Set(customers.flatMap(c => c.profiles.map(p => p.name))).size;
    const creditSales = customers
      .flatMap(c => c.profiles.flatMap(p => p.bills))
      .filter(b => b.paymentType === 'Credit' && b.creditAmount > 0)
      .reduce((sum, b) => sum + b.creditAmount, 0);
    const advancePayments = customers
      .flatMap(c => c.profiles)
      .reduce((sum, p) => sum + (p.advance?.currentamount || 0), 0);

    res.json({
      totalSales,
      users,
      creditSales,
      advancePayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});