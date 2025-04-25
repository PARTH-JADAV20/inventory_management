const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateShop } = require('../middleware/errorMiddleware');
const { validateCustomer, validateProfile, validateAdvance } = require('../middleware/validationMiddleware');
const {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateProfile,
  softDeleteProfile,
  restoreProfile,
  permanentDeleteProfile
} = require('../controllers/customerController');
const { 
  addAdvancePayment, 
  getAdvanceDetails 
} = require('../controllers/advanceController');

// Apply shop validation middleware
router.use(validateShop);

// Customer routes
router.route('/')
  .get(getCustomers)
  .post(validateCustomer, createCustomer);

router.route('/:phoneNumber')
  .get(getCustomerByPhone);

// Profile routes
router.route('/:phoneNumber/profiles/:profileId')
  .put(validateProfile, updateProfile)
  .delete(softDeleteProfile);

router.route('/:phoneNumber/profiles/:profileId/restore')
  .post(restoreProfile);

router.route('/:phoneNumber/profiles/:profileId/permanent')
  .delete(permanentDeleteProfile);

// Advance payment routes
router.route('/:phoneNumber/profiles/:profileId/advance')
  .get(getAdvanceDetails)
  .post(validateAdvance, addAdvancePayment);

module.exports = router;