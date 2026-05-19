const User = require('../models/User');
const Template = require('../models/Template');
const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// @desc    Get all users (excluding passwords)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new template
// @route   POST /api/admin/templates
const createTemplate = async (req, res) => {
  try {
    const { title, content, triggerKeywords, replyMessage, emoji } = req.body;
    const template = await Template.create({
      title,
      content,
      triggerKeywords: triggerKeywords || '',
      replyMessage: replyMessage || content,
      emoji: emoji || '🍽️',
      createdBy: req.user.id
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all templates
// @route   GET /api/admin/templates
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({}).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a template
// @route   DELETE /api/admin/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    await template.deleteOne();
    res.json({ message: 'Template removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a new learning video
// @route   POST /api/admin/videos
const uploadVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    const video = await Video.create({
      title,
      description,
      videoUrl,
      createdBy: req.user.id
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all learning videos
// @route   GET /api/admin/videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/admin/videos/:id
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    // Remove file from disk
    const filePath = path.join(__dirname, '..', video.videoUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await video.deleteOne();
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createTemplate,
  getTemplates,
  deleteTemplate,
  uploadVideo,
  getVideos,
  deleteVideo
};
