const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
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
router.post('/', auth, adminCheck, async (req, res) => {
  try {
    const { title, description, price, category, images, condition } = req.body;

    const product = new Product({
      title,
      description,
      price,
      category,
      images,
      condition,
      seller: req.user.userId,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product
router.put('/:id', auth, adminCheck, async (req, res) => {
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

// Delete product
router.delete('/:id', auth, adminCheck, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add rating/review
router.post('/:id/rating', auth, adminCheck, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.ratings.push({
      userId: req.user.userId,
      rating,
      review,
    });

    await product.save();

    res.json({ message: 'Rating added', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
