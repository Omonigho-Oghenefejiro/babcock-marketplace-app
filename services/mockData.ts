import { Product, User, Order, Review, Conversation, Message, Dispute } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Mathematics Textbook',
    description: 'Complete Mathematics textbook for first year',
    price: 5000,
    category: 'Textbooks',
    images: ['https://via.placeholder.com/400x300?text=Math+Book'],
    seller: {
      id: '101',
      fullName: 'John Seller',
      email: 'seller@babcock.edu.ng',
      phone: '08012345678',
      role: 'seller',
      isVerified: true,
      ratings: 4.5,
    },
    condition: 'Like New',
    inStock: true,
    ratings: 4.5,
    reviews: [],
  },
  {
    id: '2',
    title: 'Laptop Stand',
    description: 'Adjustable laptop stand for better ergonomics',
    price: 3500,
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x300?text=Laptop+Stand'],
    seller: {
      id: '101',
      fullName: 'John Seller',
      email: 'seller@babcock.edu.ng',
      phone: '08012345678',
      role: 'seller',
      isVerified: true,
      ratings: 4.5,
    },
    condition: 'Good',
    inStock: true,
    ratings: 4,
    reviews: [],
  },
  {
    id: '3',
    title: 'Bedding Set',
    description: 'Comfortable bedding set, includes sheets and pillows',
    price: 12000,
    category: 'Hostel Essentials',
    images: ['https://via.placeholder.com/400x300?text=Bedding+Set'],
    seller: {
      id: '101',
      fullName: 'John Seller',
      email: 'seller@babcock.edu.ng',
      phone: '08012345678',
      role: 'seller',
      isVerified: true,
      ratings: 4.5,
    },
    condition: 'New',
    inStock: true,
    ratings: 5,
    reviews: [],
  },
];

export const MOCK_USER: User = {
  id: '1001',
  fullName: 'Jane Buyer',
  email: 'buyer@babcock.edu.ng',
  phone: '08012345680',
  role: 'user',
  isVerified: true,
  profileImage: 'https://via.placeholder.com/150?text=Jane+Buyer',
  ratings: 4.2,
};

export const MOCK_ADMIN: User = {
  id: '1002',
  fullName: 'Admin User',
  email: 'admin@babcock.edu.ng',
  phone: '08012345679',
  role: 'admin',
  isVerified: true,
  profileImage: 'https://via.placeholder.com/150?text=Admin',
  ratings: 5,
};

export const EXTRA_USERS: User[] = [
  {
    id: '101',
    fullName: 'John Seller',
    email: 'seller@babcock.edu.ng',
    phone: '08012345678',
    role: 'seller',
    isVerified: true,
    profileImage: 'https://via.placeholder.com/150?text=John+Seller',
    ratings: 4.5,
  },
  {
    id: '102',
    fullName: 'Sarah Smith',
    email: 'sarah@babcock.edu.ng',
    phone: '08012345681',
    role: 'user',
    isVerified: true,
    profileImage: 'https://via.placeholder.com/150?text=Sarah',
    ratings: 4.8,
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [];

export const MOCK_DISPUTES: Dispute[] = [];
