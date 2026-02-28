const User = require('../models/User');
const logger = require('./logger');

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      $or: [{ username: 'admin' }, { email: 'admin@babcock.edu.ng' }],
    });

    if (existingAdmin) {
      existingAdmin.fullName = 'Admin User';
      existingAdmin.username = 'admin';
      existingAdmin.email = 'admin@babcock.edu.ng';
      existingAdmin.password = 'admin123';
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      return;
    }

    const adminUser = new User({
      fullName: 'Admin User',
      username: 'admin',
      email: 'admin@babcock.edu.ng',
      password: 'admin123',
      phone: '08000000000',
      role: 'admin',
      isVerified: true,
    });

    await adminUser.save();
    logger.info('Default admin account created (username: admin).');
  } catch (error) {
    logger.error('Failed to ensure default admin account', { error: error.message });
  }
};

module.exports = ensureDefaultAdmin;
