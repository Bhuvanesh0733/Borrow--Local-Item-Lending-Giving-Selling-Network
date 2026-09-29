const express = require('express');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { requestId, rated, score, comment } = req.body;
    const request = await Request.findOne({ _id: requestId, status: 'completed' });
    if (!request) return res.status(400).json({ message: 'Can only rate completed transactions' });
    const existing = await Rating.findOne({ request: requestId, rater: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already rated' });
    const rating = await Rating.create({ request: requestId, rater: req.user.id, rated, score, comment });
    const ratings = await Rating.find({ rated });
    const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
    await User.findByIdAndUpdate(rated, { trustScore: Math.round(avg * 10) / 10, ratingCount: ratings.length });
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
