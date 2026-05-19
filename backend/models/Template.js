const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  triggerKeywords: { type: String, default: '' },
  replyMessage: { type: String, default: '' },
  emoji: { type: String, default: '🍽️' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
