require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const ensureDefaultAdmin = require('./utils/ensureDefaultAdmin');
const { startSummaryScheduler } = require('./utils/summaryScheduler');

const app = express();

// CORS configuration
const envAllowedOrigins = String(process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const explicitAllowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://babcock-marketplace-app.vercel.app',
  'https://www.babcock-marketplace-app.vercel.app',
  ...envAllowedOrigins,
]);

const vercelOriginPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (explicitAllowedOrigins.has(origin)) return true;
  if (vercelOriginPattern.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

if (!explicitAllowedOrigins.size) {
  logger.warn('No CORS origins configured. Browser requests with an Origin header will be blocked.');
}

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
.then(async () => {
  logger.info('MongoDB connected');
  await ensureDefaultAdmin();
  startSummaryScheduler();
})
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
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

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
