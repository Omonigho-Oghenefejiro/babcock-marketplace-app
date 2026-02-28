const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const HELP_RESOURCES = [
  {
    id: 'help-1',
    title: 'How to buy and checkout',
    url: '/help/buying',
  },
  {
    id: 'help-2',
    title: 'How to list and manage products',
    url: '/help/selling',
  },
  {
    id: 'help-3',
    title: 'Payment and refund support',
    url: '/help/payments',
  },
];

const tickets = [];

router.get('/resources', (req, res) => {
  res.json(HELP_RESOURCES);
});

router.post('/tickets', auth, (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'subject and message are required' });
  }

  const ticket = {
    id: `ticket-${Date.now()}`,
    userId: req.user.userId,
    subject,
    message,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  tickets.unshift(ticket);
  return res.status(201).json({ message: 'Support ticket created', ticket });
});

router.get('/tickets', auth, (req, res) => {
  const mine = tickets.filter((ticket) => ticket.userId === req.user.userId || req.user.role === 'admin');
  return res.json(mine);
});

module.exports = router;
