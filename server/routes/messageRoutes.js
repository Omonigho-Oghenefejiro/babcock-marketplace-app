const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all conversations for current user (grouped by other participant)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'fullName profileImage')
      .populate('receiver', 'fullName profileImage')
      .populate('product', 'title images')
      .sort({ createdAt: -1 });

    // Group messages into conversations
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.sender._id.toString() === userId 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
      const convKey = msg.product 
        ? `${otherUserId}-${msg.product._id}` 
        : otherUserId;
      
      if (!conversationsMap.has(convKey)) {
        conversationsMap.set(convKey, {
          id: convKey,
          participants: [userId, otherUserId],
          messages: [],
          productId: msg.product?._id?.toString(),
          updatedAt: msg.createdAt
        });
      }
      
      conversationsMap.get(convKey).messages.push({
        id: msg._id.toString(),
        senderId: msg.sender._id.toString(),
        content: msg.content,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
        timestamp: msg.createdAt.toISOString(),
        read: msg.isRead
      });
    });

    // Sort messages within each conversation by timestamp ascending
    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      ...conv,
      messages: conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }));

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message (matches frontend POST /messages)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, productId, content, attachments } = req.body;

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      product: productId,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
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

// Send message to multiple recipients
router.post('/bulk', auth, async (req, res) => {
  try {
    const { receiverIds, productId, content, attachments } = req.body;

    if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.status(400).json({ message: 'receiverIds must be a non-empty array' });
    }

    const payload = receiverIds.map((receiverId) => ({
      sender: req.user.userId,
      receiver: receiverId,
      product: productId,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
    }));

    const created = await Message.insertMany(payload);

    res.status(201).json({
      message: 'Messages sent',
      count: created.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message (legacy route)
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, productId, content, attachments } = req.body;

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      product: productId,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
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

// Mark all messages in a conversation as read for current user
router.put('/conversation/:conversationId/read', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [otherUserId, productId] = String(req.params.conversationId || '').split('-');

    if (!otherUserId) {
      return res.status(400).json({ message: 'Invalid conversation id' });
    }

    const query = {
      sender: otherUserId,
      receiver: userId,
    };

    if (productId) {
      query.product = productId;
    } else {
      query.$or = [{ product: { $exists: false } }, { product: null }];
    }

    const result = await Message.updateMany(query, { isRead: true });
    return res.json({ message: 'Conversation marked as read', modifiedCount: result.modifiedCount || 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
