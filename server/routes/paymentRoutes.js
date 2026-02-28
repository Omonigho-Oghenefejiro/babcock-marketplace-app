const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

const PROMO_CODES = {
  CAMPUS5: 0.05,
  STUDENT10: 0.1,
};

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { items = [], email, shippingAddress, pickupLocation, deliveryMethod, promoCode } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'At least one item is required for payment initialization' });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.product || item.productId || item.id,
      quantity: Math.floor(Number(item.quantity || 1)),
    }));

    if (normalizedItems.some((item) => !item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ message: 'Each item must include a valid product and quantity' });
    }

    const requestedByProduct = new Map();
    for (const item of normalizedItems) {
      const key = String(item.productId);
      requestedByProduct.set(key, (requestedByProduct.get(key) || 0) + item.quantity);
    }

    const productIds = [...requestedByProduct.keys()];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    if (products.length !== productIds.length) {
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

    const orderItems = [...requestedByProduct.entries()].map(([productId, requestedQty]) => {
      const product = productMap.get(productId);
      return {
        product: product._id,
        quantity: requestedQty,
        price: Number(product.price || 0),
      };
    });

    const grossTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const normalizedPromo = String(promoCode || '').toUpperCase();
    const discountRate = PROMO_CODES[normalizedPromo] || 0;
    const discountAmount = Math.round(grossTotal * discountRate);
    const totalAmount = Math.max(0, grossTotal - discountAmount);

    if (!email || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Valid email and amount are required' });
    }

    const order = new Order({
      buyer: req.user.userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      pickupLocation,
      deliveryMethod,
      promoCode: normalizedPromo || undefined,
      discountAmount,
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
      const order = await Order.findOne({ paymentReference: req.params.reference }).populate('items.product');

      if (!order) {
        return res.status(404).json({ message: 'Order not found for payment reference' });
      }

      if (order.paymentStatus === 'completed') {
        return res.json({
          message: 'Payment already verified',
          paymentStatus: 'completed',
          order,
        });
      }

      if (!Array.isArray(order.items) || !order.items.length) {
        return res.status(400).json({ message: 'Order has no items to fulfill' });
      }

      for (const item of order.items) {
        const productDoc = item.product?._id
          ? item.product
          : await Product.findById(item.product);

        if (!productDoc) {
          return res.status(404).json({ message: 'A purchased product could not be found' });
        }

        const availableStock = Number.isFinite(Number(productDoc.quantity))
          ? Math.max(0, Math.floor(Number(productDoc.quantity)))
          : (productDoc.inStock ? 1 : 0);

        if (availableStock < item.quantity) {
          return res.status(400).json({
            message: `${productDoc.title} is no longer available in requested quantity`,
          });
        }

        productDoc.quantity = Math.max(0, Number(productDoc.quantity || 0) - Number(item.quantity || 0));
        productDoc.inStock = productDoc.quantity > 0;
        await productDoc.save();
      }

      order.paymentStatus = 'completed';
      order.status = order.status === 'pending' ? 'processing' : order.status;
      await order.save();
      await order.populate('items.product');

      return res.json({
        message: 'Payment verified and order confirmed',
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

    if (req.user.role !== 'admin' && String(order.buyer) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
