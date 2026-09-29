const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rated: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
