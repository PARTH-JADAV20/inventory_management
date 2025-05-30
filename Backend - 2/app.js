const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true }
});

const stockSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  addedDate: { type: String, required: true }, // YYYY-MM-DD
});

const deductionSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
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
    deductions: [deductionSchema],
  }],
  totalAmount: Number,
  advanceRemaining: Number,
  creditAmount: Number,
  paymentMethod: String,
  shop: String,
  otherExpenses: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
});

const advanceHistorySchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['Deposit', 'Refund', 'Return'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
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
      category: String,
      deductions: [deductionSchema],
    }],
    totalAmount: Number,
    advanceRemaining: Number,
    paymentMethod: String,
    otherExpenses: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  }],
  returns: [{
    returnId: { type: String, default: uuidv4 },
    billNo: { type: String, required: true },
    date: { type: String, required: true }, 
    items: [{
      product: { type: String, required: true },
      qty: { type: Number, required: true },
      unit: { type: String, required: true },
      pricePerQty: { type: Number, required: true }, 
      purchasePrice: { type: Number, required: true }, 
    }],
    returnAmount: { type: Number, required: true }, 
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
  amount: { type: Number, required: true },
  mode: { type: String, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }, // DD-MM-YYYY
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
    date: String, // DD-MM-YYYY
    category: String,
    deductions: [deductionSchema],
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Cleared'], default: 'Open' },
  lastTransactionDate: { type: String, required: true }, // DD-MM-YYYY
  shop: { type: String, required: true },
  paymentHistory: [paymentHistorySchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: null },
  otherExpenses: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  finalPaymentMethod: { type: String, default: null },
});

const dailySchema = new mongoose.Schema({
  date: { type: String, required: true }, // DD-MM-YYYY
  shop: { type: String, required: true }, // Shop 1 or Shop 2
  sales: {
    totalSales: { type: Number, default: 0 },
    Cash: { type: Number, default: 0 },
    Online: { type: Number, default: 0 },
    Cheque: { type: Number, default: 0 },
    Credit: { type: Number, default: 0 },
    Advance: { type: Number, default: 0 },
  },
  creditReceived: {
    totalCreditReceived: { type: Number, default: 0 },
    Cash: { type: Number, default: 0 },
    Online: { type: Number, default: 0 },
    Cheque: { type: Number, default: 0 },
  },
  expenses: {
    totalExpenses: { type: Number, default: 0 },
  },
  profit: {
    totalProfit: { type: Number, default: 0 },
    Cash: { type: Number, default: 0 },
    Online: { type: Number, default: 0 },
    Cheque: { type: Number, default: 0 },
    Credit: { type: Number, default: 0 },
    Advance: { type: Number, default: 0 },
  },
  advancePayments: {
    totalAdvance: { type: Number, default: 0 },
    Cash: { type: Number, default: 0 },
    Online: { type: Number, default: 0 },
    Cheque: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
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
const Admin = mongoose.model('Admin', adminSchema);
const Daily = mongoose.model('Daily', dailySchema);

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

// Date Conversion Helper
const convertToDDMMYYYY = (dateInput) => {
  if (!dateInput) return new Date().toLocaleDateString('en-GB').split('/').join('-');
  let dateStr = dateInput;
  if (typeof dateInput !== 'string') {
    dateStr = new Date(dateInput).toLocaleDateString('en-GB').split('/').join('-');
  }
  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
  const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (ddmmyyyyRegex.test(dateStr)) {
    const [day, month, year] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return new Date().toLocaleDateString('en-GB').split('/').join('-');
    return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  } else if (yyyymmddRegex.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return new Date().toLocaleDateString('en-GB').split('/').join('-');
    return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  }
  return new Date().toLocaleDateString('en-GB').split('/').join('-');
};

const convertToYYYYMMDD = (dateInput) => {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  let dateStr = dateInput;
  if (typeof dateInput !== 'string') {
    dateStr = new Date(dateInput).toLocaleDateString('en-GB').split('/').join('-');
  }
  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
  const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (ddmmyyyyRegex.test(dateStr)) {
    const [day, month, year] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } else if (yyyymmddRegex.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
};

// Date Validation Helper
const validateDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!ddmmyyyyRegex.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
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
    const { id } = req.body;
    const Stock = getStockModel(shop);
    const result = await Stock.deleteOne({ id: id });
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
    console.log(paymentMethod)
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);

    // Validate stock availability and calculate profit
    let totalProfit = 0;
    const billItems = [];
    for (const item of items) {
      if (!item.product || !item.qty || !item.unit || !item.pricePerQty || !item.amount || !item.category) {
        return res.status(400).json({ error: `Invalid item data for ${item.product || 'item'}` });
      }
      const stockItems = await Stock.find({ name: item.product, category: item.category, unit: item.unit })
        .sort({ addedDate: 1 });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product}` });
      }
      let qtyToDeduct = item.qty;
      let itemProfit = 0;
      const deductions = [];
      for (const stockItem of stockItems) {
        if (qtyToDeduct <= 0) break;
        const deduct = Math.min(qtyToDeduct, stockItem.quantity);
        itemProfit += (item.pricePerQty - stockItem.price) * deduct;
        deductions.push({ price: stockItem.price, quantity: deduct });
        qtyToDeduct -= deduct;
      }
      totalProfit += itemProfit;
      billItems.push({
        product: item.product,
        qty: item.qty,
        unit: item.unit,
        pricePerQty: item.pricePerQty,
        amount: item.amount,
        category: item.category,
        deductions, // Add deductions
      });
    }

    // Validate otherExpenses
    if (isNaN(otherExpenses) || otherExpenses < 0) {
      return res.status(400).json({ error: 'Other expenses must be a non-negative number' });
    }

    // Generate bill number (unchanged)
    const billNo = await getNextBillNumber(shop);
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = itemsTotal + parseFloat(otherExpenses);

    let advanceRemaining = null;
    let finalPaymentMethod = paymentMethod;

    let customer = await Customer.findOne({ phoneNumber });

    const bill = {
      billNo,
      date,
      items: billItems,
      totalAmount,
      paymentMethod: finalPaymentMethod,
      shop,
      otherExpenses: parseFloat(otherExpenses),
      profit: totalProfit,
    };

    // Save bill to customer
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
      // Validate document size
      const customerSize = Buffer.byteLength(JSON.stringify(customer));
      if (customerSize > 16 * 1024 * 1024) {
        throw new Error('Customer document exceeds 16MB limit');
      }
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
          advanceRemaining = newBalance;
          bill.advanceRemaining = newBalance;
        } else if (paymentMethod === 'Credit') {
          profile.credit = (profile.credit || 0) + totalAmount;
          bill.creditAmount = totalAmount;
        }
        if (paymentMethod !== 'Advance' && paymentMethod !== 'Credit') {
          profile.paymentMethod = finalPaymentMethod;
        }
        profile.bills.push(
          paymentMethod === 'Advance'
            ? { ...bill, advanceRemaining }
            : paymentMethod === 'Credit'
              ? { ...bill, creditAmount: totalAmount }
              : bill
        );
      }
      // Validate document size
      const customerSize = Buffer.byteLength(JSON.stringify(customer));
      if (customerSize > 16 * 1024 * 1024) {
        throw new Error('Customer document exceeds 16MB limit');
      }
      await customer.save();
    }

    for (const item of items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, category: item.category, unit: item.unit })
        .sort({ addedDate: 1 });
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
          profit: b.profit || 0,
        }))))
      .filter(s => !date || s.date === date)
      .filter(s => !search || s.profileName.toLowerCase().includes(search.toLowerCase()) || s.phoneNumber.includes(search));

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/:shop/returns', async (req, res) => {
  try {
    const { shop } = req.params;
    const { billNo, phoneNumber, profileName, items, returnAmount, date } = req.body;
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);

    // Validate input
    if (!billNo || !phoneNumber || !profileName || !items?.length || !returnAmount || returnAmount <= 0 || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validateDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY' });
    }

    const calculatedReturnAmount = items.reduce((sum, item) => sum + item.qty * item.pricePerQty, 0);
    if (parseFloat(calculatedReturnAmount.toFixed(2)) !== parseFloat(returnAmount.toFixed(2))) {
      return res.status(400).json({ error: 'Return amount does not match calculated total' });
    }

    for (const item of items) {
      if (!item.product || !item.qty || item.qty <= 0 || !item.unit || !item.pricePerQty || !item.category || !item.purchasePrice || !item.profitAdjustment) {
        return res.status(400).json({ error: `Invalid item data for ${item.product || 'item'}: missing required fields` });
      }
      if (item.purchasePrice < 0 || item.profitAdjustment < 0) {
        return res.status(400).json({ error: `Invalid purchase price or profit adjustment for ${item.product}` });
      }
    }

    // Find customer and profile
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const profile = customer.profiles.find(p => p.name.toLowerCase() === profileName.toLowerCase() && !p.deleteuser?.value);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const bill = profile.bills.find(b => b.billNo === billNo);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Validate and restock items using purchasePrice
    for (const item of items) {
      const billItem = bill.items.find(
        bi => bi.product.toLowerCase() === item.product.toLowerCase() &&
          bi.unit.toLowerCase() === item.unit.toLowerCase()
      );
      if (!billItem) {
        return res.status(400).json({ error: `Item ${item.product} not found in bill` });
      }

      const validPurchasePrice = billItem.deductions?.some(d => d.price.toFixed(2) === parseFloat(item.purchasePrice).toFixed(2));
      if (!validPurchasePrice) {
        return res.status(400).json({ error: `Invalid purchase price ₹${item.purchasePrice} for ${item.product}` });
      }

      const previousReturns = profile.returns
        ?.filter(r => r.billNo === billNo)
        ?.flatMap(r => r.items)
        ?.filter(ri =>
          ri.product.toLowerCase() === item.product.toLowerCase() &&
          ri.unit.toLowerCase() === item.unit.toLowerCase()
        )?.reduce((sum, ri) => sum + ri.qty, 0) || 0;
        console.log(previousReturns)
      const availableQty = billItem.qty - previousReturns;
      if (availableQty < item.qty) {
        return res.status(400).json({ error: `Insufficient quantity for ${item.product}: ${availableQty} available` });
      }

      // Restock using purchasePrice
      const stockItem = await Stock.findOne({
        name: { $regex: new RegExp(`^${item.product}$`, 'i') },
        unit: { $regex: new RegExp(`^${item.unit}$`, 'i') },
        category: { $regex: new RegExp(`^${item.category}$`, 'i') },
        price: parseFloat(item.purchasePrice.toFixed(2)),
      });

      if (stockItem) {
        await Stock.updateOne(
          { _id: stockItem._id },
          { $inc: { quantity: item.qty } }
        );
      } else {
        const newStock = new Stock({
          id: uuidv4(),
          name: item.product,
          quantity: item.qty,
          unit: item.unit,
          category: item.category,
          price: parseFloat(item.purchasePrice.toFixed(2)),
          addedDate: convertToYYYYMMDD(date),
        });
        await newStock.save();
      }
    }

    // Update bill profit
    const totalProfitAdjustment = items.reduce((sum, item) => sum + parseFloat(item.profitAdjustment.toFixed(2)), 0);
    if (bill.profit) {
      bill.profit = parseFloat((bill.profit - totalProfitAdjustment).toFixed(2));
      if (bill.profit < 0) bill.profit = 0;
    }

    // Handle advance payment using returnAmount
    if (bill.paymentMethod === 'Advance' && profile.advance?.value) {
      profile.advance.currentamount = parseFloat(((profile.advance.currentamount || 0) + returnAmount).toFixed(2));
      profile.advanceHistory.push({
        transactionType: 'Return',
        amount: parseFloat(returnAmount.toFixed(2)),
        date,
      });
    }

    // Save return details
    profile.returns = profile.returns || [];
    profile.returns.push({
      returnId: uuidv4(),
      billNo,
      date,
      items: items.map(({ product, qty, unit, pricePerQty, purchasePrice }) => ({
        product,
        qty,
        unit,
        pricePerQty,
        purchasePrice: parseFloat(purchasePrice.toFixed(2)),
      })),
      returnAmount: parseFloat(returnAmount.toFixed(2)),
    });

    // Validate document size
    const customerSize = Buffer.byteLength(JSON.stringify(customer));
    if (customerSize > 16 * 1024 * 1024) {
      return res.status(400).json({ error: 'Customer document exceeds 16MB limit' });
    }

    await customer.save();
    res.json({ message: 'Return processed successfully', updatedCustomer: customer });
  } catch (err) {
    console.error('processReturn error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/:shop/sales/:billNo', async (req, res) => {
  try {
    const { shop, billNo } = req.params;
    const { profileId, phoneNumber, items } = req.body;
    const Stock = getStockModel(shop);
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);

    if (!profileId || !phoneNumber || !items) {
      return res.status(400).json({ error: 'profileId, phoneNumber, and items are required' });
    }

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const profile = customer.profiles.find(p => p.profileId === profileId && !p.deleteuser.value);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or deleted' });
    }

    const billIndex = profile.bills.findIndex(b => b.billNo === billNo);
    if (billIndex === -1) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    const bill = profile.bills[billIndex];

    // Restore stock using deductions
    for (const item of bill.items) {
      const category = item.category || 'Unknown';
      const deductions = item.deductions || [];

      if (deductions.length > 0) {
        // Use deductions for precise restoration
        for (const deduction of deductions) {
          const stockItem = await Stock.findOne({
            name: item.product,
            unit: item.unit,
            category: category,
            price: deduction.price,
          });

          if (stockItem) {
            stockItem.quantity += deduction.quantity;
            await stockItem.save();
          } else {
            const newStock = new Stock({
              id: uuidv4(),
              name: item.product,
              quantity: deduction.quantity,
              unit: item.unit,
              category: category,
              price: deduction.price,
              addedDate: new Date().toISOString().split('T')[0],
            });
            await newStock.save();
          }
        }
      } else {
        // Fallback for legacy bills without deductions
        let qtyToRestore = item.qty;
        const costPrice = item.costPrice || item.pricePerQty;

        const stockItems = await Stock.find({
          name: item.product,
          unit: item.unit,
          category: category,
        }).sort({ addedDate: -1 });
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
            category: category,
            price: costPrice,
            addedDate: new Date().toISOString().split('T')[0],
          });
          await newStock.save();
        }
      }
    }

    // Handle credit sale deletion if payment method is Credit
    if (bill.paymentMethod === 'Credit') {
      const creditSale = await CreditSale.findOne({ billNumber: billNo, shop });
      if (creditSale) {
        // Perform soft delete
        creditSale.isDeleted = true;
        creditSale.deletedAt = new Date().toISOString().split('T')[0];
        await creditSale.save();

        // Perform permanent delete
        await CreditSale.deleteOne({ _id: creditSale._id });
      }
    }

    // Restore advance or credit
    let advanceRestored = 0;
    if (bill.paymentMethod === 'Advance' && bill.advanceRemaining !== undefined) {
      advanceRestored = bill.totalAmount;
      profile.advance.currentamount += advanceRestored;
    }
    if (bill.creditAmount) {
      profile.credit = (profile.credit || 0) - bill.creditAmount;
    }

    // Remove bill and update advance balances
    profile.bills.splice(billIndex, 1);
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

    // Validate document size before saving
    const customerSize = Buffer.byteLength(JSON.stringify(customer));
    if (customerSize > 16 * 1024 * 1024) {
      throw new Error('Customer document exceeds 16MB limit');
    }

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
    const { search, deleted, page, limit } = req.query;
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

    if (!phoneNumber || !profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ error: 'phoneNumber and profiles are required' });
    }

    const existingCustomer = await Customer.findOne({ phoneNumber });
    if (existingCustomer) {
      const newProfiles = profiles.map((profile) => ({
        ...profile,
        profileId: profile.profileId || uuidv4(),
      }));
      existingCustomer.profiles.push(...newProfiles);
      await existingCustomer.save();
      return res.json(existingCustomer);
    }

    const customer = new Customer({
      phoneNumber,
      profiles: profiles.map((profile) => ({
        ...profile,
        profileId: profile.profileId || uuidv4(),
      })),
    });
    await customer.save();
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

    if (!profileData || !profileData.name) {
      return res.status(400).json({ error: 'Profile data and name are required' });
    }

    if (!profileData.profileId) {
      profileData.profileId = uuidv4();
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { phoneNumber },
      { $push: { profiles: profileData } },
      { new: true, upsert: false }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
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
    const CreditSale = getCreditSaleModel(shop);

    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const profile = customer.profiles.find(p => p.profileId === profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    await CreditSale.deleteMany({
      phoneNumber,
      customerName: profile.name,
      shop,
    });

    customer.profiles = customer.profiles.filter(p => p.profileId !== profileId);
    if (customer.profiles.length === 0) {
      await Customer.deleteOne({ phoneNumber });
    } else {
      await customer.save();
    }

    res.json({ message: 'Profile and associated credit sales permanently deleted' });
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

    const formattedCreditSales = creditSales.map(sale => ({
      ...sale,
      profit: sale.profit || 0,
      items: sale.items.map(item => ({
        ...item,
        date: convertToDDMMYYYY(item.date),
      })),
      lastTransactionDate: convertToDDMMYYYY(sale.lastTransactionDate),
      deletedAt: sale.deletedAt ? convertToDDMMYYYY(sale.deletedAt) : null,
      paymentHistory: sale.paymentHistory.map(payment => ({
        ...payment,
        date: convertToDDMMYYYY(payment.date),
      })),
    }));

    res.json({
      data: formattedCreditSales,
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

    if (!customerName || !phoneNumber || !items || !Array.isArray(items) || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (isNaN(otherExpenses) || otherExpenses < 0) {
      return res.status(400).json({ error: 'Other expenses must be a non-negative number' });
    }

    for (const item of items) {
      if (!item.product || !item.qty || !item.unit || !item.pricePerUnit || !item.amount || !item.date || !item.category) {
        return res.status(400).json({ error: `Invalid item data for ${item.product || 'item'}` });
      }
      if (!validateDate(item.date)) {
        item.date = convertToDDMMYYYY(item.date);
        if (!validateDate(item.date)) {
          return res.status(400).json({ error: `Invalid date for item ${item.product}: ${item.date}` });
        }
      }
    }

    let totalProfit = 0;
    const billItems = [];
    for (const item of items) {
      const stockItems = await Stock.find({
        name: item.product,
        unit: item.unit,
        category: item.category,
      }).sort({ addedDate: -1 });

      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product} (${item.unit})` });
      }

      let qtyToDeduct = item.qty;
      const deductions = [];
      let itemProfit = 0;
      for (const stockItem of stockItems) {
        if (qtyToDeduct <= 0) break;
        const deduct = Math.min(qtyToDeduct, stockItem.quantity);
        itemProfit += (item.pricePerUnit - stockItem.price) * deduct;
        deductions.push({ price: stockItem.price, quantity: deduct });
        qtyToDeduct -= deduct;

        stockItem.quantity -= deduct;
        if (stockItem.quantity === 0) {
          await Stock.deleteOne({ _id: stockItem._id });
        } else {
          await stockItem.save();
        }
      }

      totalProfit += itemProfit;
      billItems.push({
        product: item.product,
        qty: item.qty,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        amount: item.amount,
        date: item.date,
        category: item.category,
        deductions,
      });
    }

    const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0) + parseFloat(otherExpenses);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ error: 'Total amount does not match item amounts plus other expenses' });
    }

    const billNumber = await getNextBillNumber(shop);
    const creditSale = new CreditSale({
      billNumber,
      customerName,
      phoneNumber,
      items: billItems,
      totalAmount,
      paidAmount: 0,
      status: 'Open',
      lastTransactionDate: items[0].date,
      shop,
      paymentHistory: [],
      isDeleted: false,
      deletedAt: null,
      otherExpenses: parseFloat(otherExpenses),
      profit: totalProfit,
    });

    // Validate document size
    const creditSaleSize = Buffer.byteLength(JSON.stringify(creditSale));
    if (creditSaleSize > 16 * 1024 * 1024) {
      throw new Error('Credit sale document exceeds 16MB limit');
    }
    await creditSale.save();

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
            items: billItems.map(item => ({
              product: item.product,
              qty: item.qty,
              unit: item.unit,
              pricePerQty: item.pricePerUnit,
              amount: item.amount,
              category: item.category,
              deductions: item.deductions,
            })),
            totalAmount,
            creditAmount: totalAmount,
            paymentMethod: 'Credit',
            shop,
            otherExpenses: parseFloat(otherExpenses),
            profit: totalProfit,
          }],
          deleteuser: { value: false, date: '' },
        }],
      });
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
            items: billItems.map(item => ({
              product: item.product,
              qty: item.qty,
              unit: item.unit,
              pricePerQty: item.pricePerUnit,
              amount: item.amount,
              category: item.category,
              deductions: item.deductions,
            })),
            totalAmount,
            creditAmount: totalAmount,
            paymentMethod: 'Credit',
            shop,
            otherExpenses: parseFloat(otherExpenses),
            profit: totalProfit,
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
          items: billItems.map(item => ({
            product: item.product,
            qty: item.qty,
            unit: item.unit,
            pricePerQty: item.pricePerUnit,
            amount: item.amount,
            category: item.category,
            deductions: item.deductions,
          })),
          totalAmount,
          creditAmount: totalAmount,
          paymentMethod: 'Credit',
          shop,
          otherExpenses: parseFloat(otherExpenses),
          profit: totalProfit,
        });
      }
    }

    // Validate document size
    const customerSize = Buffer.byteLength(JSON.stringify(customer));
    if (customerSize > 16 * 1024 * 1024) {
      throw new Error('Customer document exceeds 16MB limit');
    }
    await customer.save();

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

    const currentDate = convertToDDMMYYYY(new Date().toISOString().split('T')[0]);

    if (payment && payment.date) {
      payment.date = convertToDDMMYYYY(payment.date);
      if (!validateDate(payment.date)) {
        return res.status(400).json({ error: `Invalid payment date: ${payment.date}` });
      }
    }

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
      creditSale.finalPaymentMethod = payment.mode || 'Cash';
      if (creditSale.totalAmount <= 0) {
        creditSale.status = 'Cleared';
        creditSale.totalAmount = 0;
      }
    }

    if (status) {
      if (status === 'Cleared' && payment && payment.mode === 'Manual') {
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
        creditSale.finalPaymentMethod = 'Manual';
      } else if (status === 'Cleared') {
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
          creditSale.finalPaymentMethod = payment.mode || 'Cash';
        }
      }
    }

    await creditSale.save();

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

    const refundDate = convertToDDMMYYYY(date);
    if (!refundDate || !validateDate(refundDate)) {
      return res.status(400).json({ error: `Invalid refund date: ${date}` });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Refund amount must be positive' });
    }
    if (amount > creditSale.paidAmount) {
      return res.status(400).json({ error: 'Refund amount exceeds paid amount' });
    }

    creditSale.paidAmount -= amount;
    creditSale.totalAmount += amount;
    creditSale.lastTransactionDate = refundDate;
    creditSale.paymentHistory.push({
      amount: -amount,
      mode: 'Refund',
      note: note || 'Customer refund',
      date: refundDate,
    });

    if (creditSale.status === 'Cleared' && creditSale.totalAmount > 0) {
      creditSale.status = 'Open';
    }

    await creditSale.save();

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

    const paymentDate = convertToDDMMYYYY(date);
    if (!paymentDate || !validateDate(paymentDate)) {
      return res.status(400).json({ error: `Invalid payment date: ${date}` });
    }

    if (!amount || amount < 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    const maxPayment = creditSale.totalAmount + (payment.amount >= 0 ? payment.amount : 0);
    if (amount > maxPayment) {
      return res.status(400).json({ error: 'Updated payment amount exceeds remaining balance' });
    }

    if (payment.amount >= 0) {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
      creditSale.paidAmount += amount;
      creditSale.totalAmount -= amount;
    } else {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
      creditSale.paidAmount -= amount;
      creditSale.totalAmount += amount;
    }

    payment.amount = amount;
    payment.mode = mode || payment.mode;
    payment.note = note || payment.note;
    payment.date = paymentDate;

    if (creditSale.totalAmount <= 0) {
      creditSale.status = 'Cleared';
      creditSale.totalAmount = 0;
    } else {
      creditSale.status = 'Open';
    }
    creditSale.lastTransactionDate = paymentDate;

    await creditSale.save();

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

    if (payment.amount >= 0) {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
    } else {
      creditSale.paidAmount -= payment.amount;
      creditSale.totalAmount += payment.amount;
    }

    creditSale.paymentHistory.pull(paymentId);

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

    // Restore stock using deductions
    for (const item of creditSale.items) {
      console.log(`Restoring stock for item: ${item.product}, qty: ${item.qty}, unit: ${item.unit}`);
      const category = item.category || 'Unknown';
      const deductions = item.deductions || [];

      if (deductions.length > 0) {
        // Use deductions for precise restoration
        for (const deduction of deductions) {
          console.log(`Restoring: ${deduction.quantity} units at ₹${deduction.price}`);
          const stockItem = await Stock.findOne({
            name: item.product,
            unit: item.unit,
            category: category,
            price: deduction.price,
          });

          if (stockItem) {
            stockItem.quantity += deduction.quantity;
            await stockItem.save();
            console.log(`Updated stock item ${stockItem._id}: new quantity ${stockItem.quantity}`);
          } else {
            const newStock = new Stock({
              id: uuidv4(),
              name: item.product,
              quantity: deduction.quantity,
              unit: item.unit,
              category: category,
              price: deduction.price,
              addedDate: new Date().toISOString().split('T')[0],
            });
            await newStock.save();
            console.log(`Created new stock item: ${item.product}, qty: ${deduction.quantity}, price: ${deduction.price}`);
          }
        }
      } else {
        // Fallback for legacy credit sales without deductions
        let qtyToRestore = item.qty;
        console.log(`No deductions found, using fallback for ${item.product}`);
        const costPrice = item.costPrice || item.pricePerUnit;

        const stockItems = await Stock.find({
          name: item.product,
          unit: item.unit,
          category: category,
        }).sort({ addedDate: -1 });

        console.log(`Found ${stockItems.length} matching stock items for ${item.product}, category: ${category}, unit: ${item.unit}`);

        if (stockItems.length > 0) {
          for (const stockItem of stockItems) {
            if (qtyToRestore <= 0) break;
            stockItem.quantity += qtyToRestore;
            qtyToRestore = 0;
            await stockItem.save();
            console.log(`Updated stock item ${stockItem._id}: new quantity ${stockItem.quantity}`);
          }
        }

        if (qtyToRestore > 0) {
          const newStock = new Stock({
            id: uuidv4(),
            name: item.product,
            quantity: qtyToRestore,
            unit: item.unit,
            category: category,
            price: costPrice,
            addedDate: new Date().toISOString().split('T')[0],
          });
          await newStock.save();
          console.log(`Created new stock item: ${item.product}, qty: ${qtyToRestore}, category: ${category}, price: ${costPrice}`);
        }
      }
    }

    creditSale.isDeleted = true;
    creditSale.deletedAt = new Date().toISOString().split('T')[0];
    await creditSale.save();

    const customer = await Customer.findOne({ phoneNumber: creditSale.phoneNumber });
    if (customer) {
      const profile = customer.profiles.find(p => p.name === creditSale.customerName && !p.deleteuser.value);
      if (profile) {
        const billIndex = profile.bills.findIndex(b => b.billNo === creditSale.billNumber);
        if (billIndex !== -1) {
          profile.bills.splice(billIndex, 1);
          profile.credit = profile.bills.reduce((sum, b) => sum + (b.creditAmount || 0), 0);

          // Validate document size
          const customerSize = Buffer.byteLength(JSON.stringify(customer));
          if (customerSize > 16 * 1024 * 1024) {
            throw new Error('Customer document exceeds 16MB limit');
          }
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

    for (const item of creditSale.items) {
      const stockItems = await Stock.find({ name: item.product, unit: item.unit });
      const totalQty = stockItems.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < item.qty) {
        return res.status(400).json({ error: `Insufficient stock to restore ${item.product} (${item.unit})` });
      }
    }

    for (const item of creditSale.items) {
      let qtyToDeduct = item.qty;
      const stockItems = await Stock.find({ name: item.product, unit: item.unit })
        .sort({ addedDate: -1 });
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

    creditSale.isDeleted = false;
    creditSale.deletedAt = null;
    await creditSale.save();

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
          otherExpenses: creditSale.otherExpenses,
          profit: profile.bills.find(b => b.billNo === creditSale.billNumber)?.profit || 0,
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = convertToDDMMYYYY(thirtyDaysAgo.toISOString().split('T')[0]);

    await CreditSale.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgoStr },
    });

    const formattedDeletedCreditSales = deletedCreditSales.map(sale => ({
      ...sale,
      items: sale.items.map(item => ({
        ...item,
        date: convertToDDMMYYYY(item.date),
      })),
      lastTransactionDate: convertToDDMMYYYY(sale.lastTransactionDate),
      deletedAt: sale.deletedAt ? convertToDDMMYYYY(sale.deletedAt) : null,
      paymentHistory: sale.paymentHistory.map(payment => ({
        ...payment,
        date: convertToDDMMYYYY(payment.date),
      })),
    }));

    res.json({ data: formattedDeletedCreditSales });
  } catch (err) {
    console.error('Fetch deleted credit sales error:', err);
    res.status(500).json({ error: 'Failed to fetch deleted credit sales: ' + err.message });
  }
});

// Dashboard Routes
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


// Dashboard Routes
app.get('/api/:shop/total-sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);

    const customers = await Customer.find();
    const creditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      lastTransactionDate: { $gte: startDateStr, $lte: endDateStr },
    });

    let totalSales = 0;
    const salesByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
      Credit: 0,
      Advance: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.date >= startDateStr && bill.date <= endDateStr) {
            totalSales += bill.totalAmount;
            const method = bill.paymentMethod || 'Cash';
            salesByMethod[method] = (salesByMethod[method] || 0) + bill.totalAmount;
          }
        });
      });
    });

    creditSales.forEach(sale => {
      totalSales += sale.totalAmount + sale.paidAmount;
      salesByMethod.Credit = (salesByMethod.Credit || 0) + sale.totalAmount + sale.paidAmount;
    });

    res.json({
      totalSales,
      ...salesByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/total-profit', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);
    const Expense = getExpenseModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);
    const startDateYYYYMMDD = convertToYYYYMMDD(startDate);
    const endDateYYYYMMDD = convertToYYYYMMDD(endDate);

    const customers = await Customer.find();
    const creditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      status: 'Cleared',
      lastTransactionDate: { $gte: startDateStr, $lte: endDateStr },
    });
    const expenses = await Expense.find({
      date: { $gte: startDateYYYYMMDD, $lte: endDateYYYYMMDD },
    });

    let totalProfit = 0;
    const profitByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
      Credit: 0,
      Advance: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.date >= startDateStr && bill.date <= endDateStr && bill.paymentMethod !== 'Credit') {
            totalProfit += bill.profit || 0;
            const method = bill.paymentMethod || 'Cash';
            profitByMethod[method] = (profitByMethod[method] || 0) + (bill.profit || 0);
          }
        });
      });
    });

    creditSales.forEach(sale => {
      totalProfit += sale.profit || 0;
      const method = sale.finalPaymentMethod || 'Credit';
      profitByMethod[method] = (profitByMethod[method] || 0) + (sale.profit || 0);
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalProfit -= totalExpenses;

    res.json({
      totalProfit: totalProfit < 0 ? 0 : totalProfit,
      ...profitByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/users', async (req, res) => {
  try {
    const { shop } = req.params;
    const Customer = getCustomerModel(shop);

    const customers = await Customer.find();
    let totalUsers = 0;
    let creditUsers = 0;
    let advanceUsers = 0;

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        totalUsers++;
        if ((profile.credit || 0) > 0) creditUsers++;
        if (profile.advance?.value && profile.advance.currentamount > 0) advanceUsers++;
      });
    });

    res.json({
      totalUsers,
      creditUsers,
      advanceUsers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/credit-sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const CreditSale = getCreditSaleModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);

    const creditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      lastTransactionDate: { $gte: startDateStr, $lte: endDateStr },
    });

    let totalCreditGiven = 0;
    let totalCreditReceived = 0;
    const creditReceivedByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    creditSales.forEach(sale => {
      totalCreditGiven += sale.totalAmount + sale.paidAmount;
      totalCreditReceived += sale.paidAmount;
      sale.paymentHistory.forEach(payment => {
        if (payment.amount > 0 && payment.date >= startDateStr && payment.date <= endDateStr) {
          const method = payment.mode || 'Cash';
          creditReceivedByMethod[method] = (creditReceivedByMethod[method] || 0) + payment.amount;
        }
      });
    });

    res.json({
      totalCreditGiven,
      totalCreditReceived,
      ...creditReceivedByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/advance-payments', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Customer = getCustomerModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);

    const customers = await Customer.find();
    let totalAdvance = 0;
    const advanceByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value || !profile.advance?.value) return;
        profile.advanceHistory.forEach(history => {
          if (history.transactionType === 'Deposit' && history.date >= startDateStr && history.date <= endDateStr) {
            totalAdvance += history.amount;
            const method = profile.advance.paymentMethod || 'Cash';
            advanceByMethod[method] = (advanceByMethod[method] || 0) + history.amount;
          }
        });
      });
    });

    res.json({
      totalAdvance,
      ...advanceByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/recent-purchases', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Stock = getStockModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateYYYYMMDD = convertToYYYYMMDD(startDate);
    const endDateYYYYMMDD = convertToYYYYMMDD(endDate);

    const purchases = await Stock.find({
      addedDate: { $gte: startDateYYYYMMDD, $lte: endDateYYYYMMDD },
    }).sort({ addedDate: -1 }).limit(10);

    if (!purchases.length) {
      return res.json({ message: 'No recent purchases.' });
    }

    res.json(purchases.map(p => ({
      product: p.name,
      quantity: p.quantity,
      unit: p.unit,
      price: p.price,
      category: p.category,
      date: convertToDDMMYYYY(p.addedDate),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/recent-sales', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);

    const customers = await Customer.find();
    const creditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      lastTransactionDate: { $gte: startDateStr, $lte: endDateStr },
    });

    const sales = [];

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.date >= startDateStr && bill.date <= endDateStr) {
            sales.push({
              billNo: bill.billNo,
              customer: profile.name,
              amount: bill.totalAmount,
              paymentMethod: bill.paymentMethod || 'Cash',
              date: bill.date,
            });
          }
        });
      });
    });

    creditSales.forEach(sale => {
      sales.push({
        billNo: sale.billNumber,
        customer: sale.customerName,
        amount: sale.totalAmount + sale.paidAmount,
        paymentMethod: 'Credit',
        date: sale.lastTransactionDate,
      });
    });

    sales.sort((a, b) => new Date(b.date.split('-').reverse().join('-')) - new Date(a.date.split('-').reverse().join('-')));

    if (!sales.length) {
      return res.json({ message: 'No recent sales.' });
    }

    res.json(sales.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/pending-advances', async (req, res) => {
  try {
    const { shop } = req.params;
    const Customer = getCustomerModel(shop);

    const customers = await Customer.find();
    let totalPendingAdvance = 0;
    const pendingByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value || !profile.advance?.value || !profile.advance.showinadvance) return;
        const remainingAdvance = profile.advance.currentamount || 0;
        if (remainingAdvance > 0) {
          totalPendingAdvance += remainingAdvance;
          const method = profile.advance.paymentMethod || 'Cash';
          pendingByMethod[method] = (pendingByMethod[method] || 0) + remainingAdvance;
        }
      });
    });

    res.json({
      totalPendingAdvance,
      ...pendingByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/total-expenses', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Expense = getExpenseModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateYYYYMMDD = convertToYYYYMMDD(startDate);
    const endDateYYYYMMDD = convertToYYYYMMDD(endDate);

    const expenses = await Expense.find({
      date: { $gte: startDateYYYYMMDD, $lte: endDateYYYYMMDD },
    });

    let totalExpenses = 0;
    const expensesByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    expenses.forEach(expense => {
      totalExpenses += expense.amount;
      const method = expense.paymentMode || 'Cash';
      expensesByMethod[method] = (expensesByMethod[method] || 0) + expense.amount;
    });

    res.json({
      totalExpenses,
      ...expensesByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/advance-adjusted', async (req, res) => {
  try {
    const { shop } = req.params;
    const { period, date } = req.query;
    const Customer = getCustomerModel(shop);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      startDate = new Date(convertToYYYYMMDD(date));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const startDateStr = convertToDDMMYYYY(startDate);
    const endDateStr = convertToDDMMYYYY(endDate);

    const customers = await Customer.find();
    let totalAdjusted = 0;
    const adjustedByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.paymentMethod === 'Advance' && bill.date >= startDateStr && bill.date <= endDateStr) {
            totalAdjusted += bill.totalAmount;
            const method = bill.paymentMethod === 'Advance' && profile.advance?.paymentMethod ? profile.advance.paymentMethod : 'Cash';
            adjustedByMethod[method] = (adjustedByMethod[method] || 0) + bill.totalAmount;
          }
        });
      });
    });

    res.json({
      totalAdjusted,
      ...adjustedByMethod,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/:shop/sales-comparison', async (req, res) => {
  try {
    const { shop } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = convertToDDMMYYYY(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = convertToDDMMYYYY(yesterday);

    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    const lastWeekStartStr = convertToDDMMYYYY(lastWeekStart);
    const lastWeekEndStr = convertToDDMMYYYY(lastWeekEnd);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthStartStr = convertToDDMMYYYY(lastMonthStart);
    const lastMonthEndStr = convertToDDMMYYYY(lastMonthEnd);

    const todayData = await Daily.findOne({ shop, date: todayStr });
    const yesterdayData = await Daily.findOne({ shop, date: yesterdayStr });
    const lastWeekData = await Daily.find({
      shop,
      date: { $gte: lastWeekStartStr, $lte: lastWeekEndStr },
    });
    const lastMonthData = await Daily.find({
      shop,
      date: { $gte: lastMonthStartStr, $lte: lastMonthEndStr },
    });

    const todaySales = todayData ? todayData.sales.totalSales : 0;
    const yesterdaySales = yesterdayData ? yesterdayData.sales.totalSales : null;
    const lastWeekSales = lastWeekData.reduce((sum, d) => sum + d.sales.totalSales, 0);
    const lastMonthSales = lastMonthData.reduce((sum, d) => sum + d.sales.totalSales, 0);

    const yesterdayComparison = yesterdaySales !== null
      ? {
        difference: todaySales - yesterdaySales,
        percentage: yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(2) : 'N/A',
      }
      : 'N/A';

    const weeklyComparison = lastWeekSales > 0
      ? {
        difference: todaySales - lastWeekSales,
        percentage: ((todaySales - lastWeekSales) / lastWeekSales * 100).toFixed(2),
      }
      : { difference: 'N/A', percentage: 'N/A' };

    const monthlyComparison = lastMonthSales > 0
      ? {
        difference: todaySales - lastMonthSales,
        percentage: ((todaySales - lastMonthSales) / lastMonthSales * 100).toFixed(2),
      }
      : { difference: 'N/A', percentage: 'N/A' };

    res.json({
      todaySales,
      yesterdayComparison,
      weeklyComparison,
      monthlyComparison,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//Login Realted

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.json({ success: false, message: 'User not found' });

    // For simplicity, plain text check (use bcrypt in real apps)
    if (admin.password !== password) return res.json({ success: false, message: 'Incorrect password' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset credentials route
app.post('/auth/reset', async (req, res) => {
  const { newUsername, newPassword, phoneNumber } = req.body;
  try {
    const admin = await Admin.findOne({ phone: phoneNumber });
    if (!admin) return res.json({ success: false, message: 'Admin not found for phoneNumber' });
    // Update credentials
    if (newUsername) { admin.username = newUsername; }
    if (newPassword) { admin.password = newPassword; }
    await admin.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




//Save Data Daily

const saveDailyData = async (shop) => {
  try {
    const Customer = getCustomerModel(shop);
    const CreditSale = getCreditSaleModel(shop);
    const Expense = getExpenseModel(shop);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateStr = convertToDDMMYYYY(today);
    const endDateStr = startDateStr;
    const startDateYYYYMMDD = convertToYYYYMMDD(today);

    // Fetch sales data
    const customers = await Customer.find();
    const creditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      lastTransactionDate: startDateStr,
    });

    let totalSales = 0;
    const salesByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
      Credit: 0,
      Advance: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.date === startDateStr) {
            totalSales += bill.totalAmount;
            const method = bill.paymentMethod || 'Cash';
            salesByMethod[method] = (salesByMethod[method] || 0) + bill.totalAmount;
          }
        });
      });
    });

    creditSales.forEach(sale => {
      totalSales += sale.totalAmount + sale.paidAmount;
      salesByMethod.Credit = (salesByMethod.Credit || 0) + (sale.totalAmount + sale.paidAmount);
    });

    // Fetch credit received
    let totalCreditReceived = 0;
    const creditReceivedByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    creditSales.forEach(sale => {
      totalCreditReceived += sale.paidAmount;
      sale.paymentHistory.forEach(payment => {
        if (payment.amount > 0 && payment.date === startDateStr) {
          const method = payment.mode || 'Cash';
          creditReceivedByMethod[method] = (creditReceivedByMethod[method] || 0) + payment.amount;
        }
      });
    });

    // Fetch expenses
    const expenses = await Expense.find({
      date: startDateYYYYMMDD,
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Fetch profit
    const clearedCreditSales = await CreditSale.find({
      shop,
      isDeleted: false,
      status: 'Cleared',
      lastTransactionDate: startDateStr,
    });

    let totalProfit = 0;
    const profitByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
      Credit: 0,
      Advance: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value) return;
        profile.bills.forEach(bill => {
          if (bill.date === startDateStr && bill.paymentMethod !== 'Credit') {
            totalProfit += bill.profit || 0;
            const method = bill.paymentMethod || 'Cash';
            profitByMethod[method] = (profitByMethod[method] || 0) + (bill.profit || 0);
          }
        });
      });
    });

    clearedCreditSales.forEach(sale => {
      totalProfit += sale.profit || 0;
      const method = sale.finalPaymentMethod || 'Credit';
      profitByMethod[method] = (profitByMethod[method] || 0) + (sale.profit || 0);
    });

    totalProfit -= totalExpenses;

    // Fetch advance payments
    let totalAdvance = 0;
    const advanceByMethod = {
      Cash: 0,
      Online: 0,
      Cheque: 0,
    };

    customers.forEach(customer => {
      customer.profiles.forEach(profile => {
        if (profile.deleteuser.value || !profile.advance?.value) return;
        profile.advanceHistory.forEach(history => {
          if (history.transactionType === 'Deposit' && history.date === startDateStr) {
            totalAdvance += history.amount;
            const method = profile.advance.paymentMethod || 'Cash';
            advanceByMethod[method] = (advanceByMethod[method] || 0) + history.amount;
          }
        });
      });
    });

    // Save to Daily collection
    const dailyData = new Daily({
      date: startDateStr,
      shop,
      sales: {
        totalSales,
        ...salesByMethod,
      },
      creditReceived: {
        totalCreditReceived,
        ...creditReceivedByMethod,
      },
      expenses: {
        totalExpenses,
      },
      profit: {
        totalProfit: totalProfit < 0 ? 0 : totalProfit,
        ...profitByMethod,
      },
      advancePayments: {
        totalAdvance,
        ...advanceByMethod,
      },
    });

    await dailyData.save();
    console.log(`Daily data saved for ${shop} on ${startDateStr}`);
  } catch (err) {
    console.error(`Error saving daily data for ${shop}:`, err);
  }
};

// Schedule cron job to run at 11:30 PM daily for both shops
cron.schedule('30 23 * * *', () => {
  console.log('Running daily data save at 11:30 PM');
  saveDailyData('Shop 1');
  saveDailyData('Shop 2');
}, {
  timezone: "Asia/Kolkata"
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});