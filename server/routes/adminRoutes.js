const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

// Get all unapproved products
router.get('/products/pending', auth, adminCheck, async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false })
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve product
router.put('/products/:id/approve', auth, adminCheck, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    res.json({ message: 'Product approved', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject product
router.delete('/products/:id/reject', auth, adminCheck, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle user verification
router.put('/users/:id/verify', auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({ message: 'User verification toggled', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard stats
router.get('/stats', auth, adminCheck, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
