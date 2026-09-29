const express = require('express');
const Message = require('../models/Message');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:requestId', auth, async (req, res) => {
  const request = await Request.findOne({
    _id: req.params.requestId,
    $or: [{ owner: req.user.id }, { requester: req.user.id }],
    chatUnlocked: true
  });
  if (!request) return res.status(403).json({ message: 'Chat not available' });
  const messages = await Message.find({ request: req.params.requestId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });
  await Message.updateMany({ request: req.params.requestId, sender: { $ne: req.user.id } }, { read: true });
  res.json(messages);
});

router.post('/:requestId', auth, async (req, res) => {
  const request = await Request.findOne({
    _id: req.params.requestId,
    $or: [{ owner: req.user.id }, { requester: req.user.id }],
    chatUnlocked: true
  });
  if (!request) return res.status(403).json({ message: 'Chat not available' });
  const message = await Message.create({ request: req.params.requestId, sender: req.user.id, text: req.body.text });
  const populated = await message.populate('sender', 'name avatar');
  const recipient = request.owner.toString() === req.user.id ? request.requester : request.owner;
  await Notification.create({
    user: recipient, type: 'message',
    title: 'New Message', body: req.body.text.substring(0, 60),
    link: `/chat/${req.params.requestId}`
  });
  req.app.get('io')?.to(req.params.requestId).emit('message', populated);
  res.status(201).json(populated);
});

module.exports = router;
