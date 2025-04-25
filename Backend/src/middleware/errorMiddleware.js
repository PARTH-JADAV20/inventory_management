// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error
  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Validate shop parameter
const validateShop = (req, res, next) => {
  const { shop } = req.params;
  if (shop !== 'shop1' && shop !== 'shop2') {
    return res.status(400).json({ message: 'Invalid shop. Must be "shop1" or "shop2"' });
  }
  next();
};

module.exports = { errorHandler, validateShop };