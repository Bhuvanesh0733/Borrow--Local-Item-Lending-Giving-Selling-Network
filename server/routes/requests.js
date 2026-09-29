const express = require('express');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { type } = req.query; // 'incoming' | 'outgoing'
  const filter = type === 'incoming' ? { owner: req.user.id } : { requester: req.user.id };
  const requests = await Request.find(filter)
    .populate('item', 'title images listingType price isFree')
    .populate('requester', 'name avatar trustScore')
    .populate('owner', 'name avatar trustScore')
    .sort({ createdAt: -1 });
  res.json(requests);
});

router.post('/', auth, async (req, res) => {
  try {
    const { item, owner, type, message, dueDate } = req.body;
    const existing = await Request.findOne({ item, requester: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'Request already sent' });
    const request = await Request.create({ item, requester: req.user.id, owner, type, message, dueDate });
    await Notification.create({
      user: owner, type: 'request',
      title: 'New Request', body: 'Someone wants to borrow/buy your item',
      link: `/requests`
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/accept', auth, async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, owner: req.user.id });
  if (!request) return res.status(404).json({ message: 'Not found' });
  request.status = 'accepted';
  request.chatUnlocked = true;
  await request.save();
  await Notification.create({
    user: request.requester, type: 'accepted',
    title: 'Request Accepted!', body: 'Your request was accepted. Chat is now unlocked.',
    link: `/chat/${request._id}`
  });
  res.json(request);
});

router.put('/:id/decline', auth, async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, owner: req.user.id });
  if (!request) return res.status(404).json({ message: 'Not found' });
  request.status = 'declined';
  await request.save();
  await Notification.create({
    user: request.requester, type: 'declined',
    title: 'Request Declined', body: 'Your request was declined.',
    link: `/requests`
  });
  res.json(request);
});

router.put('/:id/complete', auth, async (req, res) => {
  const request = await Request.findOne({
    _id: req.params.id,
    $or: [{ owner: req.user.id }, { requester: req.user.id }]
  });
  if (!request) return res.status(404).json({ message: 'Not found' });
  request.status = 'completed';
  await request.save();
  res.json(request);
});

router.put('/:id/cancel', auth, async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, requester: req.user.id, status: 'pending' });
  if (!request) return res.status(404).json({ message: 'Not found' });
  request.status = 'cancelled';
  await request.save();
  res.json(request);
});

module.exports = router;
