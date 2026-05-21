const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// We import the models to query existing data for a dynamic test
const User = require('./models/User');
const Campaign = require('./models/Campaign');

const serverUrl = process.argv[2] || 'http://localhost:5000';

async function runTest() {
  console.log('='.repeat(60));
  console.log('🤖  AUTODM WEBHOOK AUTOMATION TEST SUITE');
  console.log(`📡  Target Server: ${serverUrl}`);
  console.log('='.repeat(60) + '\n');

  // Try to connect to MongoDB to fetch live user/campaign data for the test
  let activeCampaign = null;
  let igAccountId = 'mock_instagram_user_id';
  let postId = 'mock_post_id';
  let keyword = 'book';

  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodchow';
    if (mongoUri.includes('Vansh@1154')) {
      mongoUri = mongoUri.replace('Vansh@1154', 'Vansh%401154');
    }
    await mongoose.connect(mongoUri);
    console.log('📦  Connected to MongoDB to fetch test data...');

    // Find an active campaign that has a user with instagram connected
    const campaigns = await Campaign.find({ status: 'active' }).populate('user');
    activeCampaign = campaigns.find(c => c.user && c.user.instagram && c.user.instagram.accountId);

    if (activeCampaign) {
      igAccountId = activeCampaign.user.instagram.accountId;
      postId = activeCampaign.postId || 'mock_post_id';
      keyword = activeCampaign.triggerKeywords[0] || 'book';
      console.log(`🎯  Found Active Campaign: "${activeCampaign.title}"`);
      console.log(`    - Keyword: "${keyword}"`);
      console.log(`    - Post ID: "${postId}"`);
      console.log(`    - IG Account: "${igAccountId}"`);
    } else {
      console.log('⚠️   No active campaigns with connected IG accounts found in local DB.');
      console.log('    Using fallback mock values for testing.');
    }
  } catch (err) {
    console.log('⚠️   Could not connect to MongoDB:', err.message);
    console.log('    Proceeding with fallback mock values for testing.');
  } finally {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }

  console.log('\n--- SELECT A TEST TYPE ---');
  console.log('1. Simulate Instagram Comment (Comment -> DM)');
  console.log('2. Simulate Direct Message (DM Keyword -> DM)');
  
  const selection = process.argv[3] || '1'; // default to comment test

  if (selection === '1') {
    // 1. Simulate Comment Webhook
    console.log(`\n🚀 Simulating Comment webhook to ${serverUrl}/api/ig/webhooks...`);
    const payload = {
      object: 'instagram',
      entry: [
        {
          id: igAccountId,
          time: Date.now(),
          changes: [
            {
              field: 'comments',
              value: {
                verb: 'add',
                id: '9999999999999',
                text: `This looks awesome! Send me ${keyword} please!`,
                media: { id: postId },
                from: { id: 'test_follower_id', username: 'ig_tester_user' }
              }
            }
          ]
        }
      ]
    };

    try {
      console.log('Payload sending:', JSON.stringify(payload, null, 2));
      const response = await axios.post(`${serverUrl}/api/ig/webhooks`, payload);
      console.log('\n✅  SERVER RESPONSE:');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Data:   ${response.data}`);
      console.log('\n💡  Check your backend server logs to see the automation trigger logs!');
    } catch (err) {
      console.error('\n❌  TEST FAILED:');
      console.error(err.message);
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(`Response Data: ${JSON.stringify(err.response.data)}`);
      }
    }
  } else {
    // 2. Simulate DM Webhook
    console.log(`\n🚀 Simulating DM webhook to ${serverUrl}/api/ig/webhooks...`);
    const payload = {
      object: 'instagram',
      entry: [
        {
          id: igAccountId,
          time: Date.now(),
          messaging: [
            {
              sender: { id: 'test_follower_id' },
              recipient: { id: igAccountId },
              timestamp: Date.now(),
              message: {
                mid: 'mid.mock_message_id_99999',
                text: keyword
              }
            }
          ]
        }
      ]
    };

    try {
      console.log('Payload sending:', JSON.stringify(payload, null, 2));
      const response = await axios.post(`${serverUrl}/api/ig/webhooks`, payload);
      console.log('\n✅  SERVER RESPONSE:');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Data:   ${response.data}`);
      console.log('\n💡  Check your backend server logs to see the automation trigger logs!');
    } catch (err) {
      console.error('\n❌  TEST FAILED:');
      console.error(err.message);
      if (err.response) {
        console.error(`Status: ${err.response.status}`);
        console.error(`Response Data: ${JSON.stringify(err.response.data)}`);
      }
    }
  }
}

runTest();
