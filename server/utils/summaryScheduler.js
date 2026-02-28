const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('./notificationService');
const logger = require('./logger');

const buildSummary = async (days) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orders = await Order.find({ paymentStatus: 'completed', createdAt: { $gte: since } });
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  return {
    count: orders.length,
    totalRevenue,
    since,
  };
};

const sendSalesSummary = async (period = 'daily') => {
  const days = period === 'weekly' ? 7 : 1;
  const summary = await buildSummary(days);
  const admins = await User.find({ role: 'admin' }).select('email');

  await Promise.all(admins.map((admin) => sendEmail({
    to: admin.email,
    subject: `${period === 'weekly' ? 'Weekly' : 'Daily'} Sales Summary`,
    text: `Orders: ${summary.count}\nRevenue: ₦${summary.totalRevenue.toLocaleString()}\nSince: ${summary.since.toISOString()}`,
  })));

  logger.info('Sales summary notifications sent', { period, recipients: admins.length, orders: summary.count });
};

const startSummaryScheduler = () => {
  setInterval(() => {
    sendSalesSummary('daily').catch((error) => logger.error('Daily summary failed', { error: error.message }));
  }, 24 * 60 * 60 * 1000);

  setInterval(() => {
    sendSalesSummary('weekly').catch((error) => logger.error('Weekly summary failed', { error: error.message }));
  }, 7 * 24 * 60 * 60 * 1000);
};

module.exports = {
  startSummaryScheduler,
  sendSalesSummary,
};
