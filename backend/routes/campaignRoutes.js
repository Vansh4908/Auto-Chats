const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, updateCampaignStatus, deleteCampaign } = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getCampaigns)
  .post(upload.single('photo'), createCampaign);

router.route('/:id')
  .put(updateCampaignStatus)
  .delete(deleteCampaign);

module.exports = router;
