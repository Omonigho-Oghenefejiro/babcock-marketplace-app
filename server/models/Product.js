const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['Textbooks', 'Electronics', 'Clothing', 'Hostel Essentials', 'Food', 'Others'],
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair'],
    default: 'Good',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: Number,
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
