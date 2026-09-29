const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' }
  },
  trustScore: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  notificationPrefs: {
    requests: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    dueDates: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('User', userSchema);
