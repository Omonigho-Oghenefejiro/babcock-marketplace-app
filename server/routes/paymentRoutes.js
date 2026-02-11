const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { items, totalAmount, email, shippingAddress } = req.body;

    const order = new Order({
      buyer: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
    });

    await order.save();

    // Initialize Paystack payment
    const paystackData = {
      email,
      amount: Math.round(totalAmount * 100), // Convert to kobo
      reference: `${order._id}-${Date.now()}`,
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    order.paymentReference = paystackData.reference;
    await order.save();

    res.json({
      message: 'Payment initialized',
      paymentUrl: response.data.data.authorization_url,
      orderId: order._id,
      reference: paystackData.reference,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      const order = await Order.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { paymentStatus: 'completed' },
        { new: true }
      );

      return res.json({
        message: 'Payment verified',
        paymentStatus: 'completed',
        order,
      });
    }

    res.status(400).json({ message: 'Payment verification failed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
