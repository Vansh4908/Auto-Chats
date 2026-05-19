const Campaign = require('../models/Campaign');

// @desc    Get user's campaigns
// @route   GET /api/campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res) => {
  try {
    const {
      title,
      triggerKeywords,
      replyMessage,
      postId,
      isGlobal,
      expiresAt,
      status,
      ctaUrls,
      ctaUrl,
      hasPdf,
      pdfName,
      promoCode,
      requireFollow,
      followMessage,
      followBtnLabel
    } = req.body;

    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Convert comma-separated string back to array if sent as text
    let keywordsArray = triggerKeywords;
    if (typeof triggerKeywords === 'string') {
      keywordsArray = triggerKeywords.split(',').map(k => k.trim().toLowerCase());
    }

    // Handle singular ctaUrl fallback for backward compatibility
    let finalCtaUrls = ctaUrls;
    if (!finalCtaUrls && ctaUrl) {
      finalCtaUrls = [ctaUrl];
    }

    const campaign = await Campaign.create({
      title,
      triggerKeywords: keywordsArray,
      replyMessage,
      photoUrl,
      postId,
      isGlobal: isGlobal === true || isGlobal === 'true',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: status || 'setup',
      user: req.user.id,
      ctaUrls: finalCtaUrls || [],
      hasPdf: hasPdf === true || hasPdf === 'true',
      pdfName: pdfName || '',
      promoCode: promoCode || '',
      requireFollow: requireFollow === true || requireFollow === 'true',
      followMessage: followMessage || 'To claim your link, you must follow our account first! Click below to follow.',
      followBtnLabel: followBtnLabel || 'Send Link'
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update campaign status
// @route   PUT /api/campaigns/:id/status
const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure status is valid
    if (!['active', 'paused', 'setup'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaignStatus,
  deleteCampaign
};
