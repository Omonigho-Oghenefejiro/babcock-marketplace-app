const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Add to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Math.floor(Number(req.body.quantity || 1));

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const availableStock = Number.isFinite(Number(product.quantity))
      ? Math.max(0, Math.floor(Number(product.quantity)))
      : (product.inStock ? 1 : 0);

    if (availableStock <= 0 || product.inStock === false) {
      return res.status(400).json({ message: 'This item is out of stock' });
    }

    const user = await User.findById(req.user.userId);

    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} unit${availableStock === 1 ? '' : 's'} available for this item`,
        });
      }
      existingItem.quantity = nextQuantity;
    } else {
      if (quantity > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} unit${availableStock === 1 ? '' : 's'} available for this item`,
        });
      }
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({ message: 'Item added to cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from cart
router.post('/remove', auth, async (req, res) => {
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
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.productId');

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
