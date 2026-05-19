const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  triggerKeywords: [{ type: String }],
  replyMessage: { type: String, required: true },
  photoUrl: { type: String },
  status: { type: String, enum: ['active', 'paused', 'setup'], default: 'setup' },
  postId: { type: String }, // Instagram post ID this campaign is attached to
  // DM Planner fields
  isGlobal: { type: Boolean, default: false }, // true = auto-apply to new posts
  expiresAt: { type: Date, default: null },    // null = never expires
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Rich Campaign customization fields
  ctaUrls: [{ type: String }],
  hasPdf: { type: Boolean, default: false },
  pdfName: { type: String, default: "" },
  promoCode: { type: String, default: "" },
  requireFollow: { type: Boolean, default: false },
  followMessage: { type: String, default: "To claim your link, you must follow our account first! Click below to follow." },
  followBtnLabel: { type: String, default: "Send Link" },
  stats: {
    sent: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
