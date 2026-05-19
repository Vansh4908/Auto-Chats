const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback, connectAccount, disconnectAccount, getPosts, verifyWebhook, handleWebhook } = require('../controllers/igController');
const { protect } = require('../middleware/auth');

router.get('/auth-url', protect, getAuthUrl);
router.get('/callback', handleCallback); // Public callback
router.post('/connect', protect, connectAccount);
router.post('/disconnect', protect, disconnectAccount);
router.get('/posts', protect, getPosts);

// Webhook routes
router.get('/webhooks', verifyWebhook);
router.post('/webhooks', handleWebhook);

module.exports = router;
