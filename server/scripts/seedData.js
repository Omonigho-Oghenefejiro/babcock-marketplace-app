require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
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
        description: 'Complete Mathematics textbook for first year students. Covers calculus, algebra, and statistics.',
        price: 5000,
        category: 'Textbooks',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'Like New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Laptop Stand',
        description: 'Adjustable laptop stand for better ergonomics. Fits laptops up to 17 inches.',
        price: 3500,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'Good',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Bedding Set',
        description: 'Comfortable bedding set, includes sheets and pillows. Perfect for hostel rooms.',
        price: 12000,
        category: 'Hostel Essentials',
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Scientific Calculator',
        description: 'Casio FX-991ES Plus scientific calculator. Essential for engineering and science students.',
        price: 8500,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness. USB rechargeable for hostel use.',
        price: 4500,
        category: 'Hostel Essentials',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Introduction to Programming',
        description: 'Programming textbook covering Python and Java basics. Great for CS100 students.',
        price: 6500,
        category: 'Textbooks',
        images: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80'],
        seller: users[2]._id,
        condition: 'Good',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Electric Kettle',
        description: '1.5L electric kettle for quick boiling. Low power consumption.',
        price: 5500,
        category: 'Hostel Essentials',
        images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=800&q=80'],
        seller: users[2]._id,
        condition: 'Like New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Wireless Earbuds',
        description: 'Bluetooth 5.0 wireless earbuds with charging case. Great battery life.',
        price: 15000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80'],
        seller: users[0]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Backpack',
        description: 'Laptop backpack with multiple compartments. Water resistant material.',
        price: 7500,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
        seller: users[2]._id,
        condition: 'New',
        isApproved: true,
        inStock: true,
      },
      {
        title: 'Chemistry Lab Coat',
        description: 'White lab coat for chemistry practicals. Size M-XL available.',
        price: 3000,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80'],
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
