require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');

const app = express();

// CORS configuration
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

if (!allowedOrigins.length) {
  logger.warn('CORS_ALLOWED_ORIGINS is not set. Browser requests with an Origin header will be blocked.');
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB connected'))
.catch(err => logger.error('MongoDB connection error', { error: err.message }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/userRoutes')); // Alias for frontend compatibility
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled server error', { message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
