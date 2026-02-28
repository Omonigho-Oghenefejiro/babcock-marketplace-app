const express = require('express');
const PDFDocument = require('pdfkit');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const { sendSalesSummary } = require('../utils/summaryScheduler');

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

// Get all products for admin dashboard (approved, pending, active, disabled)
router.get('/products', auth, adminCheck, async (req, res) => {
  try {
    const products = await Product.find()
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
    ).populate('seller', 'fullName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product?.seller?._id) {
      await Message.create({
        sender: req.user.userId,
        receiver: product.seller._id,
        product: product._id,
        content: `Your listing \"${product.title}\" has been approved and is now live.`,
        attachments: [],
      });
    }

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

// Sales reporting overview
router.get('/reports/sales', auth, adminCheck, async (req, res) => {
  try {
    const salesHistory = await Order.find({ paymentStatus: 'completed' })
      .populate('buyer', 'fullName email')
      .populate('items.product', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    const topSellingProducts = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          title: '$product.title',
          unitsSold: 1,
          revenue: 1,
        },
      },
    ]);

    const lowStockItems = await Product.find({ quantity: { $lte: 5 } })
      .select('title quantity inStock category price')
      .sort({ quantity: 1 });

    const dailyTrend = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
    ]);

    res.json({
      salesHistory,
      topSellingProducts,
      lowStockItems,
      dailyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export sales summary report (CSV)
router.get('/reports/sales/export', auth, adminCheck, async (req, res) => {
  try {
    const sales = await Order.find({ paymentStatus: 'completed' })
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 });

    const header = ['Order ID', 'Buyer', 'Email', 'Total Amount', 'Status', 'Created At'];
    const rows = sales.map((order) => [
      order._id,
      order.buyer?.fullName || '',
      order.buyer?.email || '',
      order.totalAmount,
      order.status,
      order.createdAt?.toISOString?.() || '',
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','));

    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-summary.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export sales summary report (PDF)
router.get('/reports/sales/export-pdf', auth, adminCheck, async (req, res) => {
  try {
    const sales = await Order.find({ paymentStatus: 'completed' })
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-summary.pdf');

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text('Sales Summary Report', { underline: true });
    doc.moveDown();

    sales.forEach((order, idx) => {
      doc
        .fontSize(10)
        .text(
          `${idx + 1}. ${order._id} | ${order.buyer?.fullName || 'Buyer'} | ₦${order.totalAmount.toLocaleString()} | ${order.status} | ${order.createdAt.toISOString()}`
        );
      doc.moveDown(0.2);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Low stock notification feed
router.get('/inventory/low-stock', auth, adminCheck, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold || 5);
    const items = await Product.find({ quantity: { $lte: threshold } })
      .select('title quantity inStock category updatedAt')
      .sort({ quantity: 1 });

    res.json({
      threshold,
      count: items.length,
      items,
      message: items.length ? 'Low-stock items found' : 'No low-stock items',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Current inventory levels
router.get('/inventory', auth, adminCheck, async (req, res) => {
  try {
    const items = await Product.find()
      .select('title category quantity inStock price isActive updatedAt')
      .sort({ updatedAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Import inventory updates via CSV text
router.post('/inventory/import', auth, adminCheck, async (req, res) => {
  try {
    const csvData = String(req.body.csvData || '').trim();
    if (!csvData) {
      return res.status(400).json({ message: 'csvData is required' });
    }

    const lines = csvData.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV must include header and at least one row' });
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const titleIndex = header.indexOf('title');
    const quantityIndex = header.indexOf('quantity');

    if (titleIndex === -1 || quantityIndex === -1) {
      return res.status(400).json({ message: 'CSV header must include title and quantity columns' });
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i += 1) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const title = cols[titleIndex];
      const quantity = Math.max(0, Math.floor(Number(cols[quantityIndex])));

      if (!title || !Number.isFinite(quantity)) {
        skipped += 1;
        continue;
      }

      const product = await Product.findOne({ title });
      if (!product) {
        skipped += 1;
        continue;
      }

      product.quantity = quantity;
      product.inStock = quantity > 0;
      await product.save();
      updated += 1;
    }

    return res.json({ message: 'Inventory import completed', updated, skipped });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Trigger summary notifications manually
router.post('/reports/sales/notify', auth, adminCheck, async (req, res) => {
  try {
    const period = req.body.period === 'weekly' ? 'weekly' : 'daily';
    await sendSalesSummary(period);
    res.json({ message: `${period} summary notifications sent` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
