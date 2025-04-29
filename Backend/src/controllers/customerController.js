const asyncHandler = require('express-async-handler');
const { getCustomerModel } = require('../models/Customer');

// Get all customers
const getCustomers = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { search, showDeleted } = req.query;

  const Customer = getCustomerModel(shop);

  let query = {};
  if (search) {
    query = {
      $or: [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'profiles.name': { $regex: search, $options: 'i' } }
      ]
    };
  }

  const customers = await Customer.find(query);

  const filteredCustomers = customers.map(customer => {
    const filteredProfiles = customer.profiles.filter(profile =>
      showDeleted === 'true' || !profile.deleteuser.value
    );

    return {
      ...customer.toObject(),
      profiles: filteredProfiles
    };
  });

  res.status(200).json(filteredCustomers);
});

// Get customer by phone number
const getCustomerByPhone = asyncHandler(async (req, res) => {
  const { shop, phoneNumber } = req.params;
  const Customer = getCustomerModel(shop);

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.status(200).json(customer);
});

// Create new customer
const createCustomer = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { phoneNumber, profiles } = req.body;

  const Customer = getCustomerModel(shop);

  const existingCustomer = await Customer.findOne({ phoneNumber });

  if (existingCustomer) {
    // Check for duplicate profile names within the existing customer
    const newProfileNames = profiles.map(p => p.name);
    const existingProfileNames = existingCustomer.profiles.map(p => p.name);
    const duplicates = newProfileNames.filter(name => existingProfileNames.includes(name));
    if (duplicates.length > 0) {
      res.status(400);
      throw new Error(`Profile name(s) already exist: ${duplicates.join(', ')}`);
    }

    // Add new profiles to existing customer
    const profilesWithIds = profiles.map(profile => ({
      ...profile,
      profileId: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      advanceHistory: profile.advance.value && profile.advance.currentamount > 0 && profile.advanceHistory?.length ? profile.advanceHistory : [],
      bills: [],
      deleteuser: { value: false, date: '' }
    }));

    existingCustomer.profiles.push(...profilesWithIds);
    const updatedCustomer = await existingCustomer.save();

    console.log('Updated customer with new profiles:', updatedCustomer.toObject());

    res.status(200).json(updatedCustomer);
  } else {
    // Create new customer
    const profilesWithIds = profiles.map(profile => ({
      ...profile,
      profileId: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      advanceHistory: profile.advance.value && profile.advance.currentamount > 0 && profile.advanceHistory?.length ? profile.advanceHistory : [],
      bills: [],
      deleteuser: { value: false, date: '' }
    }));

    const customer = await Customer.create({
      phoneNumber,
      profiles: profilesWithIds
    });

    console.log('Created customer:', customer.toObject());

    res.status(201).json(customer);
  }
});

// Update customer profile
const updateProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  const { name, advance } = req.body;

  const Customer = getCustomerModel(shop);

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const profileIndex = customer.profiles.findIndex(p => p.profileId === profileId);

  if (profileIndex === -1) {
    res.status(404);
    throw new Error('Profile not found');
  }

  // Update specific fields
  if (name) {
    customer.profiles[profileIndex].name = name;
  }
  if (advance) {
    customer.profiles[profileIndex].advance = {
      ...customer.profiles[profileIndex].advance,
      ...advance
    };
  }

  await customer.save();

  console.log('Updated customer:', customer.toObject());

  res.status(200).json(customer);
});

// Soft delete profile
const softDeleteProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;

  const Customer = getCustomerModel(shop);

  const result = await Customer.updateOne(
    { phoneNumber, 'profiles.profileId': profileId },
    {
      $set: {
        'profiles.$.deleteuser.value': true,
        'profiles.$.deleteuser.date': new Date().toISOString()
      }
    }
  );

  if (result.matchedCount === 0) {
    res.status(404);
    throw new Error('Profile not found');
  }

  res.status(200).json({ message: 'Profile marked as deleted' });
});

// Restore soft-deleted profile
const restoreProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;

  const Customer = getCustomerModel(shop);

  const customer = await Customer.findOne({ phoneNumber, 'profiles.profileId': profileId });

  if (!customer) {
    res.status(404);
    throw new Error('Profile not found');
  }

  const profile = customer.profiles.find(p => p.profileId === profileId);

  if (!profile || !profile.deleteuser.value) {
    res.status(404);
    throw new Error('Profile not found or not deleted');
  }

  const deletionDate = new Date(profile.deleteuser.date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (deletionDate < thirtyDaysAgo) {
    res.status(400);
    throw new Error('Profile cannot be restored after 30 days of deletion');
  }

  await Customer.updateOne(
    { phoneNumber, 'profiles.profileId': profileId },
    {
      $set: {
        'profiles.$.deleteuser.value': false,
        'profiles.$.deleteuser.date': ''
      }
    }
  );

  res.status(200).json({ message: 'Profile restored' });
});

// Permanently delete profile
const permanentDeleteProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;

  const Customer = getCustomerModel(shop);

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.profiles = customer.profiles.filter(p => p.profileId !== profileId);

  if (customer.profiles.length === 0) {
    await Customer.deleteOne({ phoneNumber });
    return res.status(200).json({ message: 'Customer and profile permanently deleted' });
  }

  await customer.save();

  res.status(200).json({ message: 'Profile permanently deleted' });
});

// Add advance payment
const addAdvancePayment = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  const { date, amount, paymentMethod } = req.body;

  const Customer = getCustomerModel(shop);

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const profileIndex = customer.profiles.findIndex(p => p.profileId === profileId);

  if (profileIndex === -1) {
    res.status(404);
    throw new Error('Profile not found');
  }

  const profile = customer.profiles[profileIndex];
  const transactionType = amount < 0 ? 'Refund' : 'Deposit';
  const absoluteAmount = Math.abs(amount);

  if (transactionType === 'Refund' && profile.advance.currentamount < absoluteAmount) {
    res.status(400);
    throw new Error('Refund amount cannot exceed current advance balance');
  }

  customer.profiles[profileIndex].advance.currentamount += amount;
  customer.profiles[profileIndex].advance.paymentMethod = paymentMethod;
  customer.profiles[profileIndex].advanceHistory.push({
    transactionType,
    amount: absoluteAmount,
    date
  });

  await customer.save();

  console.log('Updated customer after advance payment:', customer.toObject());

  res.status(200).json(customer);
});

module.exports = {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateProfile,
  softDeleteProfile,
  restoreProfile,
  permanentDeleteProfile,
  addAdvancePayment
};