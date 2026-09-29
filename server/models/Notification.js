const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request', 'message', 'due_date', 'accepted', 'declined', 'rating'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
