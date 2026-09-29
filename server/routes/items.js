const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/items - search + filter + geo
router.get('/', async (req, res) => {
  try {
    const { q, category, listingType, isFree, lat, lng, radius = 10000, page = 1, limit = 20 } = req.query;
    const filter = { isAvailable: true };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (isFree === 'true') filter.isFree = true;
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      };
    }
    const items = await Item.find(filter)
      .populate('owner', 'name avatar trustScore')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Item.countDocuments(filter);
    res.json({ items, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/items/map - all pins for map view
router.get('/map', async (req, res) => {
  try {
    const { lat, lng, radius = 20000 } = req.query;
    const filter = { isAvailable: true };
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      };
    }
    const items = await Item.find(filter, 'title listingType isFree price location images category').limit(200);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate('owner', 'name avatar trustScore ratingCount location');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, condition, listingType, price, isFree, borrowDuration, location } = req.body;
    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const item = await Item.create({
      owner: req.user.id, title, description, category, condition,
      listingType, price: parseFloat(price) || 0,
      isFree: isFree === 'true' || isFree === true,
      borrowDuration: borrowDuration ? parseInt(borrowDuration) : null,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      images
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });
  if (!item) return res.status(404).json({ message: 'Not found or unauthorized' });
  const updates = { ...req.body };
  if (req.files?.length) updates.images = req.files.map(f => `/uploads/${f.filename}`);
  if (updates.location && typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
  Object.assign(item, updates);
  await item.save();
  res.json(item);
});

router.delete('/:id', auth, async (req, res) => {
  const item = await Item.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!item) return res.status(404).json({ message: 'Not found or unauthorized' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
