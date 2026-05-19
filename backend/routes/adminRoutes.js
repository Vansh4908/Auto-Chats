const express = require('express');
const router = express.Router();
const { getUsers, createTemplate, getTemplates, deleteTemplate, uploadVideo, getVideos, deleteVideo } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All admin routes must be protected and restricted to admin role
router.use(protect, admin);

router.get('/users', getUsers);
router.route('/templates')
  .post(createTemplate)
  .get(getTemplates);
router.delete('/templates/:id', deleteTemplate);

router.route('/videos')
  .post(upload.single('video'), uploadVideo)
  .get(getVideos);
router.delete('/videos/:id', deleteVideo);

module.exports = router;
