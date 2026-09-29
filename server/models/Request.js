const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['borrow', 'buy', 'free'], required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'], default: 'pending' },
  dueDate: { type: Date, default: null },
  chatUnlocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
