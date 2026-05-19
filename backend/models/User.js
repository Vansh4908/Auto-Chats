const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  notifs: {
    dm_sent: { type: Boolean, default: true },
    clicks: { type: Boolean, default: true },
    weekly: { type: Boolean, default: true }
  },
  instagram: {
    accountId: { type: String },
    username: { type: String },
    followers: { type: Number },
    profilePic: { type: String },
    isBusinessAccount: { type: Boolean, default: false },
    accessToken: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
