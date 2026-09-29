const express = require('express');
const User = require('../models/User');
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.put('/me', auth, async (req, res) => {
  const { name, bio, location, notificationPrefs } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, bio, location, notificationPrefs }, { new: true }).select('-password');
  res.json(user);
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { avatar: `/uploads/${req.file.filename}` }, { new: true }).select('-password');
  res.json(user);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email -notificationPrefs');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const ratings = await Rating.find({ rated: req.params.id }).populate('rater', 'name avatar');
  res.json({ user, ratings });
});

module.exports = router;
