const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['tools', 'electronics', 'books', 'sports', 'clothing', 'furniture', 'kitchen', 'other'],
    required: true
  },
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], required: true },
  images: [{ type: String }],
  listingType: { type: String, enum: ['borrow', 'sell', 'give'], required: true },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  borrowDuration: { type: Number, default: null }, // days
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, default: '' }
  },
  isAvailable: { type: Boolean, default: true },
  views: { type: Number, default: 0 }
}, { timestamps: true });

itemSchema.index({ location: '2dsphere' });
itemSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Item', itemSchema);
