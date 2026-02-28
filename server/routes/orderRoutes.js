const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const { sendEmail } = require('../utils/notificationService');

const router = express.Router();

const PROMO_CODES = {
  CAMPUS5: 0.05,
  STUDENT10: 0.1,
};

// Get user's orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get purchased items (flattened)
router.get('/purchased-items', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user.userId,
      paymentStatus: 'completed',
      status: { $ne: 'cancelled' },
    })
      .populate('items.product')
      .sort({ createdAt: -1 });

    const purchasedItems = orders.flatMap((order) =>
      (Array.isArray(order.items) ? order.items : []).map((item) => {
        const product = item.product;
        const userReview = Array.isArray(product?.ratings)
          ? product.ratings.find((entry) => String(entry.userId) === String(req.user.userId))
          : null;

        return {
          orderId: order._id,
          purchasedAt: order.createdAt,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          productId: product?._id || item.product,
          title: product?.title || 'Unavailable product',
          image: Array.isArray(product?.images) ? product.images[0] : '',
          price: Number(item.price || product?.price || 0),
          quantity: Number(item.quantity || 1),
          isLive: Boolean(product && product.isActive !== false && product.isApproved !== false),
          hasRated: Boolean(userReview),
          myRating: userReview
            ? {
                rating: Number(userReview.rating || 0),
                review: String(userReview.review || ''),
                createdAt: userReview.createdAt,
              }
            : null,
        };
      })
    );

    res.json(purchasedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : Array.isArray(req.body.orderItems)
        ? req.body.orderItems
        : [];

    if (!rawItems.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const normalizedItems = rawItems.map((item) => ({
      productId: item.product || item.productId,
      quantity: Math.floor(Number(item.quantity || 1)),
    }));

    if (normalizedItems.some((item) => !item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ message: 'Each order item must have a valid product and quantity' });
    }

    const requestedByProduct = new Map();
    for (const item of normalizedItems) {
      const key = String(item.productId);
      requestedByProduct.set(key, (requestedByProduct.get(key) || 0) + item.quantity);
    }

    const uniqueProductIds = [...requestedByProduct.keys()];
    const products = await Product.find({ _id: { $in: uniqueProductIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    if (products.length !== uniqueProductIds.length) {
      return res.status(404).json({ message: 'One or more products were not found' });
    }

    for (const [productId, requestedQty] of requestedByProduct.entries()) {
      const product = productMap.get(productId);
      const availableStock = Number.isFinite(Number(product.quantity))
        ? Math.max(0, Math.floor(Number(product.quantity)))
        : (product.inStock ? 1 : 0);

      if (availableStock <= 0 || product.inStock === false) {
        return res.status(400).json({ message: `${product.title} is out of stock` });
      }

      if (requestedQty > availableStock) {
        return res.status(400).json({
          message: `${product.title} has only ${availableStock} unit${availableStock === 1 ? '' : 's'} left`,
        });
      }
    }

    const items = [...requestedByProduct.entries()].map(([productId, requestedQty]) => {
      const product = productMap.get(productId);
      return {
        product: product._id,
        quantity: requestedQty,
        price: Number(product.price || 0),
      };
    });

    const grossTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { shippingAddress, paymentReference, pickupLocation, deliveryMethod, estimatedFulfillmentAt, promoCode } = req.body;
    const normalizedPromo = String(promoCode || '').toUpperCase();
    const discountRate = PROMO_CODES[normalizedPromo] || 0;
    const discountAmount = Math.round(grossTotal * discountRate);
    const totalAmount = Math.max(0, grossTotal - discountAmount);
    const buyer = await User.findById(req.user.userId);
    
    const order = new Order({
      buyer: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentReference,
      pickupLocation,
      deliveryMethod: deliveryMethod || 'pickup',
      estimatedFulfillmentAt,
      promoCode: normalizedPromo || undefined,
      discountAmount,
      paymentStatus: 'completed',
      status: 'processing'
    });

    await order.save();

    for (const [productId, requestedQty] of requestedByProduct.entries()) {
      const product = productMap.get(productId);
      product.quantity = Math.max(0, Number(product.quantity || 0) - requestedQty);
      product.inStock = product.quantity > 0;
      await product.save();
    }

    await order.populate('items.product');

    if (buyer?.email) {
      await sendEmail({
        to: buyer.email,
        subject: `Order confirmation: ${order._id}`,
        text: `Your order was placed successfully. Total: ₦${order.totalAmount.toLocaleString()}.`,
      });
    }
    
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.put('/:orderId/status', auth, adminCheck, async (req, res) => {
  try {
    const { status, trackingNumber, estimatedFulfillmentAt } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, trackingNumber, estimatedFulfillmentAt },
      { new: true }
    ).populate('items.product').populate('buyer', 'fullName email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order?.buyer?.email) {
      await sendEmail({
        to: order.buyer.email,
        subject: `Order status updated: ${order._id}`,
        text: `Your order status is now ${order.status}.${order.trackingNumber ? ` Tracking number: ${order.trackingNumber}.` : ''}`,
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track order details
router.get('/:orderId/tracking', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('buyer', 'fullName email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && String(order.buyer._id) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json({
      orderId: order._id,
      status: order.status,
      estimatedFulfillmentAt: order.estimatedFulfillmentAt,
      trackingNumber: order.trackingNumber,
      pickupLocation: order.pickupLocation,
      deliveryMethod: order.deliveryMethod,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Assign pickup location and estimated time
router.put('/:orderId/pickup-location', auth, adminCheck, async (req, res) => {
  try {
    const { pickupLocation, estimatedFulfillmentAt } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        pickupLocation,
        estimatedFulfillmentAt,
        deliveryMethod: 'pickup',
      },
      { new: true }
    ).populate('items.product').populate('buyer', 'fullName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual cancellation by admin
router.put('/:orderId/cancel', auth, adminCheck, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'cancelled' },
      { new: true }
    ).populate('items.product').populate('buyer', 'fullName email');

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

// Search orders by ID, buyer name/email, or date
router.get('/search', auth, adminCheck, async (req, res) => {
  try {
    const { orderId, buyer, date } = req.query;
    const query = {};

    if (orderId) {
      query._id = orderId;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    let orders = await Order.find(query)
      .populate('buyer', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    if (buyer) {
      const needle = String(buyer).toLowerCase();
      orders = orders.filter((order) => {
        const name = String(order.buyer?.fullName || '').toLowerCase();
        const email = String(order.buyer?.email || '').toLowerCase();
        return name.includes(needle) || email.includes(needle);
      });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export orders in CSV/Excel-compatible format
router.get('/export', auth, adminCheck, async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    const orders = await Order.find()
      .populate('buyer', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    const header = [
      'Order ID',
      'Buyer',
      'Email',
      'Items',
      'Total Amount',
      'Status',
      'Payment Status',
      'Pickup Location',
      'Created At',
    ];

    const rows = orders.map((order) => {
      const items = (order.items || []).map((item) => `${item.product?.title || 'Item'} x${item.quantity}`).join(' | ');
      return [
        order._id,
        order.buyer?.fullName || '',
        order.buyer?.email || '',
        items,
        order.totalAmount,
        order.status,
        order.paymentStatus,
        order.pickupLocation || '',
        order.createdAt?.toISOString?.() || '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const ext = format === 'excel' ? 'xlsx' : 'csv';
    const mime = format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename=orders-export.${ext}`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
