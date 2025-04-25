const asyncHandler = require('express-async-handler');
const { getCustomerModel } = require('../models/Customer');

// Get all customers
const getCustomers = asyncHandler(async (req, res) => {
  const { shop } = req.params;
  const { search, showDeleted } = req.query;
  
  const Customer = getCustomerModel(shop);
  
  // Build query based on search parameter
  let query = {};
  if (search) {
    query = {
      $or: [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'profiles.name': { $regex: search, $options: 'i' } }
      ]
    };
  }
  
  // Fetch customers
  const customers = await Customer.find(query);
  
  // Filter profiles based on showDeleted parameter
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
  
  // Check if customer with phone number already exists
  const existingCustomer = await Customer.findOne({ phoneNumber });
  
  if (existingCustomer) {
    res.status(400);
    throw new Error('Phone number already exists');
  }
  
  // Create customer with profiles
  const profilesWithIds = profiles.map(profile => ({
    ...profile,
    profileId: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    advanceHistory: [],
    bills: [],
    deleteuser: { value: false, date: '' }
  }));
  
  const customer = await Customer.create({
    phoneNumber,
    profiles: profilesWithIds
  });
  
  res.status(201).json(customer);
});

// Update customer profile
const updateProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  const updateData = req.body;
  
  const Customer = getCustomerModel(shop);
  
  // Find customer
  const customer = await Customer.findOne({ phoneNumber });
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Find profile index
  const profileIndex = customer.profiles.findIndex(p => p.profileId === profileId);
  
  if (profileIndex === -1) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  // Update profile fields
  Object.keys(updateData).forEach(key => {
    if (key !== 'profileId' && key !== 'bills' && key !== 'advanceHistory') {
      customer.profiles[profileIndex][key] = updateData[key];
    }
  });
  
  await customer.save();
  
  res.status(200).json(customer);
});

// Soft delete profile
const softDeleteProfile = asyncHandler(async (req, res) => {
  const { shop, phoneNumber, profileId } = req.params;
  
  const Customer = getCustomerModel(shop);
  
  // Update profile deleteuser field
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
  
  // Find customer and profile
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
  
  // Check if deletion is within 30 days
  const deletionDate = new Date(profile.deleteuser.date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (deletionDate < thirtyDaysAgo) {
    res.status(400);
    throw new Error('Profile cannot be restored after 30 days of deletion');
  }
  
  // Update profile deleteuser field
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
  
  // Find customer
  const customer = await Customer.findOne({ phoneNumber });
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  
  // Remove profile from profiles array
  customer.profiles = customer.profiles.filter(p => p.profileId !== profileId);
  
  // If no profiles left, delete customer
  if (customer.profiles.length === 0) {
    await Customer.deleteOne({ phoneNumber });
    return res.status(200).json({ message: 'Customer and profile permanently deleted' });
  }
  
  await customer.save();
  
  res.status(200).json({ message: 'Profile permanently deleted' });
});

module.exports = {
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateProfile,
  softDeleteProfile,
  restoreProfile,
  permanentDeleteProfile
};