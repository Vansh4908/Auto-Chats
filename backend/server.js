const express = require('express');
const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log every request
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// --- MongoDB Database Setup ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodchow')
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ig', require('./routes/igRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));

// Public read routes for templates and videos (available to all logged-in users)
const { getTemplates, getVideos } = require('./controllers/adminController');
const { protect } = require('./middleware/auth');
app.get('/api/templates', protect, getTemplates);
app.get('/api/videos', protect, getVideos);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
