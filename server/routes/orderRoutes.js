const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

// Get user's orders
router.get('/myorders', auth, adminCheck, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order
router.post('/', auth, adminCheck, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentReference } = req.body;
    
    const order = new Order({
      buyer: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentReference,
      paymentStatus: 'completed',
      status: 'processing'
    });

    await order.save();
    await order.populate('items.product');
    
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.put('/:orderId/status', auth, adminCheck, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request return
router.post('/:orderId/return', auth, adminCheck, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'return_requested' },
      { new: true }
    ).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
router.get('/', auth, adminCheck, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
