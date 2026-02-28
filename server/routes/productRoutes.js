const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, availability, page = 1, limit = 20 } = req.query;

    let query = {
      isApproved: { $ne: false },
      isActive: { $ne: false },
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (availability === 'in-stock') {
      query.quantity = { $gt: 0 };
      query.inStock = true;
    }

    if (availability === 'out-of-stock') {
      query.$or = [{ inStock: false }, { quantity: { $lte: 0 } }];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('seller', 'fullName email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's listings (approved + pending)
router.get('/mine', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId })
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'fullName email phone')
      .populate('ratings.userId', 'fullName profileImage');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, category, images, condition } = req.body;
    const rawQuantity = Number(req.body.quantity);
    const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.floor(rawQuantity) : 1;

    const product = new Product({
      title,
      description,
      price,
      category,
      images,
      condition,
      quantity,
      inStock: quantity > 0,
      isActive: true,
      seller: req.user.userId,
    });

    await product.save();

    res.status(201).json({
      message: 'Product submitted successfully',
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enable/disable product listing
router.patch('/:id/active', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    product.isActive = Boolean(req.body.isActive);
    await product.save();

    res.json({ message: `Product ${product.isActive ? 'enabled' : 'disabled'}`, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add rating/review
router.post('/:id/rating', auth, async (req, res) => {
  try {
    const { rating, review, reviewImages } = req.body;
    const normalizedRating = Number(rating);

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (String(product.seller) === String(req.user.userId)) {
      return res.status(403).json({ message: 'You cannot review your own listing' });
    }

    const purchasedOrder = await Order.findOne({
      buyer: req.user.userId,
      paymentStatus: 'completed',
      status: { $ne: 'cancelled' },
      'items.product': product._id,
    });

    if (!purchasedOrder) {
      return res.status(403).json({ message: 'Only buyers who purchased this item can rate it' });
    }

    const existingRating = product.ratings.find((entry) => String(entry.userId) === String(req.user.userId));

    if (existingRating) {
      existingRating.rating = normalizedRating;
      existingRating.review = review;
      existingRating.reviewImages = Array.isArray(reviewImages) ? reviewImages : [];
      existingRating.createdAt = new Date();
    } else {
      product.ratings.push({
        userId: req.user.userId,
        rating: normalizedRating,
        review,
        reviewImages: Array.isArray(reviewImages) ? reviewImages : [],
      });
    }

    await product.save();

    res.json({ message: 'Rating added', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
