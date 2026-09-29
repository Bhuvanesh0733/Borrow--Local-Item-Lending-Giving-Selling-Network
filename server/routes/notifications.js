const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
});

router.put('/read-all', auth, async (req, res) => {
  await Notification.updateMany({ user: req.user.id }, { read: true });
  res.json({ message: 'All marked as read' });
});

router.put('/:id/read', auth, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true });
  res.json({ message: 'Marked as read' });
});

module.exports = router;
