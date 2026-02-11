const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      product: productId,
      content,
    });

    await message.save();
    await message.populate('sender', 'fullName profileImage');
    await message.populate('receiver', 'fullName profileImage');

    res.status(201).json({
      message: 'Message sent',
      data: message,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userId },
      ],
    })
      .populate('sender', 'fullName profileImage')
      .populate('receiver', 'fullName profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
