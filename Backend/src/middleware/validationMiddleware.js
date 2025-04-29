const Joi = require('joi');

// Advance transaction validation schema
const advanceTransactionSchema = Joi.object({
  transactionType: Joi.string().valid('Deposit', 'Refund').required(),
  amount: Joi.number().required(),
  date: Joi.date().required()
});

// Customer validation schema
const customerSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  profiles: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      advance: Joi.object({
        value: Joi.boolean().required(),
        currentamount: Joi.number().default(0),
        showinadvance: Joi.boolean().default(true),
        paymentMethod: Joi.string().default('Cash')
      }).default({
        value: false,
        currentamount: 0,
        showinadvance: true,
        paymentMethod: 'Cash'
      }),
      advanceHistory: Joi.array().items(advanceTransactionSchema).default([]),
      paymentMethod: Joi.string().default('Cash'),
      credit: Joi.number().default(0),
      deleteuser: Joi.object({
        value: Joi.boolean().default(false),
        date: Joi.string().allow('').default('')
      }).default({
        value: false,
        date: ''
      })
    })
  ).required()
});

// Profile validation schema
const profileSchema = Joi.object({
  name: Joi.string().required(),
  advance: Joi.object({
    value: Joi.boolean().required(),
    currentamount: Joi.number(),
    showinadvance: Joi.boolean(),
    paymentMethod: Joi.string()
  }),
  paymentMethod: Joi.string(),
  credit: Joi.number()
});

// Advance payment validation schema
const advanceSchema = Joi.object({
  date: Joi.date().required(),
  amount: Joi.number().required(),
  paymentMethod: Joi.string().required()
});

// Sale validation schema
const saleSchema = Joi.object({
  billNo: Joi.string().required(),
  date: Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/).required(),
  phoneNumber: Joi.string().required(),
  profileName: Joi.string().required(),
  paymentType: Joi.string().valid('Cash', 'Online', 'Card', 'Cheque', 'Credit', 'Advance').required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().min(0.01).required(),
      unit: Joi.string().required(),
      pricePerQty: Joi.number().min(0.01).required(),
      amount: Joi.number().min(0.01).required()
    })
  ).required(),
  totalAmount: Joi.number().min(0.01).required()
});

// Stock validation schema
const stockSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().min(0.01).required(),
  unit: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().min(0.01).required(),
  addedDate: Joi.date().default(Date.now)
});

// Stock bulk delete validation schema
const stockDeleteSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  unit: Joi.string().required()
});

// Expense validation schema
const expenseSchema = Joi.object({
  date: Joi.date().required(),
  category: Joi.string().required(),
  expenseDescription: Joi.string().allow(''),
  amount: Joi.number().min(0.01).required(),
  paidTo: Joi.string().required(),
  paymentMode: Joi.string().required()
});

// Expense filter validation schema
const expenseFilterSchema = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date().min(Joi.ref('startDate')),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/),
  paidTo: Joi.string(),
  category: Joi.string()
}).custom((value, helpers) => {
  if ((value.startDate || value.endDate) && value.month) {
    return helpers.error('any.invalid');
  }
  if (value.startDate && !value.endDate) {
    return helpers.error('any.invalid');
  }
  if (!value.endDate && !value.startDate && !value.month && !value.paidTo && !value.category) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Filter validation');

// Credit sale validation schema
const creditSaleSchema = Joi.object({
  customerName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().min(0.01).required(),
      unit: Joi.string().required(),
      pricePerUnit: Joi.number().min(0.01).required(),
      amount: Joi.number().min(0.01).required(),
      date: Joi.date().required()
    })
  ).required(),
  totalAmount: Joi.number().min(0.01).required()
});

// Dashboard filter validation schema
const dashboardFilterSchema = Joi.object({
  shop: Joi.string().valid('All Shops', 'Shop A', 'Shop B').required(),
  timePeriod: Joi.string().valid('Today', 'This Week', 'This Month').required()
});

// Middleware to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

// Middleware to validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

module.exports = {
  validateCustomer: validateRequest(customerSchema),
  validateProfile: validateRequest(profileSchema),
  validateAdvance: validateRequest(advanceSchema),
  validateSale: validateRequest(saleSchema),
  validateStock: validateRequest(stockSchema),
  validateStockDelete: validateRequest(stockDeleteSchema),
  validateExpense: validateRequest(expenseSchema),
  validateExpenseFilter: validateQuery(expenseFilterSchema),
  validateCreditSale: validateRequest(creditSaleSchema),
  validateDashboardFilter: validateQuery(dashboardFilterSchema),
};