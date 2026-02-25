const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

// Add to cart
router.post('/add', auth, adminCheck, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.userId);

    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({ message: 'Item added to cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from cart
router.post('/remove', auth, adminCheck, async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.user.userId);
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);

    await user.save();

    res.json({ message: 'Item removed from cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get cart
router.get('/', auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.productId');

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
