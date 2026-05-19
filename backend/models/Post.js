const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  igPostId: { type: String, required: true },
  caption: { type: String },
  mediaType: { type: String }, // IMAGE, VIDEO, CAROUSEL_ALBUM
  mediaUrl: { type: String },
  permalink: { type: String },
  timestamp: { type: Date },
  likeCount: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
