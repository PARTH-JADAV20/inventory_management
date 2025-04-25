const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorMiddleware');
const customerRoutes = require('./routes/customerRoutes');
const stockRoutes = require('./routes/stockRoutes');
const salesRoutes = require('./routes/salesRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// CORS Configurations
app.use(cors({ origin: '*' }));

// const corsOptions = {
//   origin: [
//     'http://localhost:3000',
//     'http://localhost:5173',
//     'http://localhost:5174',
//     'http://127.0.0.1:3000',
//     'http://127.0.0.1:5000',
//     'http://127.0.0.1:5173'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };


// Routes
app.use('/api/:shop/customers', customerRoutes);
app.use('/api/:shop/stock', stockRoutes);
app.use('/api/:shop/sales', salesRoutes);
app.use('/api/:shop/expenses', expenseRoutes);

// Shop validation middleware
app.use((req, res, next) => {
  const shop = req.params.shop;
  if (shop !== 'shop1' && shop !== 'shop2') {
    return res.status(400).json({ message: 'Invalid shop. Must be "shop1" or "shop2"' });
  }
  next();
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });