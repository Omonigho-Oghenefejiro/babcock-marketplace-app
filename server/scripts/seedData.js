require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.insertMany([
      {
        fullName: 'John Seller',
        email: 'seller@babcock.edu.ng',
        password: 'password123',
        phone: '08012345678',
        role: 'seller',
        isVerified: true,
      },
      {
        fullName: 'Admin User',
        email: 'admin@babcock.edu.ng',
        password: 'password123',
        phone: '08012345679',
        role: 'admin',
        isVerified: true,
      },
      {
        fullName: 'Jane Buyer',
        email: 'buyer@babcock.edu.ng',
        password: 'password123',
        phone: '08012345680',
        role: 'user',
        isVerified: true,
      },
    ]);
    console.log(`Created ${users.length} users`);

    // Create sample products
    const products = await Product.insertMany([
      {
        title: 'Mathematics Textbook',
        description: 'Complete Mathematics textbook for first year',
        price: 5000,
        category: 'Textbooks',
        images: ['https://via.placeholder.com/400x300?text=Math+Book'],
        seller: users[0]._id,
        condition: 'Like New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Laptop Stand',
        description: 'Adjustable laptop stand for better ergonomics',
        price: 3500,
        category: 'Electronics',
        images: ['https://via.placeholder.com/400x300?text=Laptop+Stand'],
        seller: users[0]._id,
        condition: 'Good',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Bedding Set',
        description: 'Comfortable bedding set, includes sheets and pillows',
        price: 12000,
        category: 'Hostel Essentials',
        images: ['https://via.placeholder.com/400x300?text=Bedding+Set'],
        seller: users[0]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
    ]);
    console.log(`Created ${products.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
