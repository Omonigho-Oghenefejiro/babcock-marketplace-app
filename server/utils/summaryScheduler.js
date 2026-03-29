const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('./notificationService');
const logger = require('./logger');

const SCHEDULER_TIMEOUT = 30000; // 30 seconds max for entire job

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
  try {
    const days = period === 'weekly' ? 7 : 1;
    const summary = await buildSummary(days);
    const admins = await User.find({ role: 'admin' }).select('email');

    if (admins.length === 0) {
      logger.info('No admins found to send summary to', { period });
      return;
    }

    // Send emails in parallel but don't wait for all to complete
    // This prevents one slow email from blocking the entire job
    const emailPromises = admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: `${period === 'weekly' ? 'Weekly' : 'Daily'} Sales Summary`,
        text: `Orders: ${summary.count}\nRevenue: ₦${summary.totalRevenue.toLocaleString()}\nSince: ${summary.since.toISOString()}`,
      }).catch((err) => {
        logger.warn(`Failed to send summary to ${admin.email}`, { error: err.message });
        return null;
      })
    );

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r?.sent).length;

    logger.info('Sales summary notifications processed', { 
      period, 
      total: admins.length, 
      successful: successCount, 
      orders: summary.count 
    });
  } catch (error) {
    logger.error(`${period} summary job failed`, { error: error.message });
  }
};

const startSummaryScheduler = () => {
  // Run daily summary - start after 1 second, then repeat every 24 hours
  setTimeout(() => {
    sendSalesSummary('daily').catch((error) => 
      logger.error('Daily summary job crashed', { error: error.message })
    );
  }, 1000);
  
  setInterval(() => {
    // Wrap in timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      logger.warn('Daily summary job exceeded timeout and was terminated');
    }, SCHEDULER_TIMEOUT);

    sendSalesSummary('daily')
      .finally(() => clearTimeout(timeoutId))
      .catch((error) => logger.error('Daily summary job crashed', { error: error.message }));
  }, 24 * 60 * 60 * 1000);

  // Run weekly summary - start after 2 seconds, then repeat every 7 days
  setTimeout(() => {
    sendSalesSummary('weekly').catch((error) => 
      logger.error('Weekly summary job crashed', { error: error.message })
    );
  }, 2000);

  setInterval(() => {
    const timeoutId = setTimeout(() => {
      logger.warn('Weekly summary job exceeded timeout and was terminated');
    }, SCHEDULER_TIMEOUT);

    sendSalesSummary('weekly')
      .finally(() => clearTimeout(timeoutId))
      .catch((error) => logger.error('Weekly summary job crashed', { error: error.message }));
  }, 7 * 24 * 60 * 60 * 1000);

  logger.info('Schedulers started', { dailyInterval: '24h', weeklyInterval: '7d' });
};

module.exports = {
  startSummaryScheduler,
  sendSalesSummary,
};
