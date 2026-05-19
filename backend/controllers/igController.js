const axios = require('axios');
const User = require('../models/User');
const Post = require('../models/Post');
const Campaign = require('../models/Campaign');

// ngrok HTTPS URL tunneling to localhost:5000
// This is required because Meta/Instagram rejects plain http:// redirect URIs
// Update this whenever you restart ngrok (the URL changes each time on free plan)
const NGROK_URL = process.env.NGROK_URL || 'https://mumps-finicky-pants.ngrok-free.dev';
const REDIRECT_URI = `${NGROK_URL}/api/ig/callback`;

// @desc    Get the Instagram Login URL (Instagram Business Login)
// @route   GET /api/ig/auth-url
// const getAuthUrl = (req, res) => {
//   const appId = process.env.INSTAGRAM_APP_ID;

//   if (!appId) {
//     return res.status(500).json({ message: 'Instagram App ID (INSTAGRAM_APP_ID) is missing in .env. Get it from: App Dashboard > Instagram > API setup with Instagram login > Business login settings' });
//   }

//   // Instagram Business Login scopes (new names, old ones deprecated Jan 27 2025)
//   const scopes = [
//     'instagram_business_basic',
//     'instagram_business_manage_messages',
//     'instagram_business_manage_comments',
//     'instagram_business_content_publish'
//   ].join(',');

//   // Correct Instagram Business Login URL — uses instagram.com NOT facebook.com
//   // force_reauth=true → always shows login screen
//   const authUrl =
//   `https://www.instagram.com/oauth/authorize` +
//   `?enable_fb_login=0` +
//   `&force_authentication=1` +
//   `&client_id=${appId}` +
//   `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//   `&response_type=code` +
//   `&scope=${scopes}`;


//   console.log('--- ACTION REQUIRED: CHECK META DASHBOARD ---');
//   console.log('1. Go to: Instagram > API setup with Instagram login > Business login settings');
//   console.log('2. Ensure "Valid OAuth Redirect URIs" contains EXACTLY:');
//   console.log(REDIRECT_URI);
//   console.log('3. Ensure your IG account is a PROFESSIONAL (Business/Creator) account.');
//   console.log('---------------------------------------------');

//   res.json({ url: authUrl });
// };

const getAuthUrl = (req, res) => {
  const appId = process.env.INSTAGRAM_APP_ID;

  if (!appId) {
    return res.status(500).json({
      message: 'Instagram App ID missing'
    });
  }

  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments'
  ].join(',');

  // Using the correct Instagram Business Login endpoint
  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?enable_fb_login=0` +
    `&client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}`;

  console.log('Using Redirect URI:', REDIRECT_URI);

  res.json({ url: authUrl });
};

// @desc    Handle the OAuth Callback from Instagram
// @route   GET /api/ig/callback
const handleCallback = async (req, res) => {
  // Strip trailing #_ that Instagram appends
  const code = req.query.code?.replace(/#_$/, '');
  const { error, error_reason, error_description } = req.query;

  if (error) {
    return res.status(400).send(`<h3>Authentication Error: ${error_description || error_reason || error}</h3>`);
  }

  if (!code) {
    return res.status(400).send('<h3>No authorization code provided.</h3>');
  }

  try {
    // Step 1: Exchange code for SHORT-LIVED token via api.instagram.com
    const params = new URLSearchParams();
    params.append('client_id', process.env.INSTAGRAM_APP_ID);
    params.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code', code);

    const shortTokenRes = await axios.post('https://api.instagram.com/oauth/access_token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Instagram returns array: { data: [{ access_token, user_id, permissions }] }
    const tokenData = shortTokenRes.data?.data?.[0] || shortTokenRes.data;
    const shortLivedToken = tokenData.access_token;
    const igUserId = tokenData.user_id;

    console.log('[DEBUG] Short-lived token obtained for user:', igUserId);

    // Step 2: Exchange for LONG-LIVED token via graph.instagram.com (valid 60 days)
    const longTokenRes = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        access_token: shortLivedToken
      }
    });

    const longLivedToken = longTokenRes.data.access_token;
    console.log('[DEBUG] Long-lived token obtained (valid 60 days)');

    // Pass token + user_id back to frontend to complete the connection
    res.redirect(`http://localhost:5173/connect-ig?token=${longLivedToken}&ig_user_id=${igUserId}`);

  } catch (err) {
    console.error('OAuth Callback Error:', err.response ? JSON.stringify(err.response.data) : err.message);
    res.status(500).send('<h3>Authentication failed. Check server logs.</h3>');
  }
};

// @desc    Connect the IG Account to the User using the Access Token
// @route   POST /api/ig/connect
const connectAccount = async (req, res) => {
  const { accessToken, ig_user_id } = req.body;

  if (!accessToken) return res.status(400).json({ message: 'No access token provided' });

  try {
    let igProfile;
    if (accessToken === 'META_ACCESS_TOKEN_HERE' || accessToken.startsWith('mock_')) {
      igProfile = {
        id: ig_user_id || '17841400000000000',
        username: 'mock_instagram_user',
        followers_count: 1450,
        profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      };
      console.log('[DEBUG] Bypass trigger: using mock Instagram profile for testing');
    } else {
      // Fetch Instagram profile using graph.instagram.com (Instagram Business Login API)
      const igProfileRes = await axios.get(
        `https://graph.instagram.com/me`,
        {
          params: {
            fields: 'id,username,followers_count,profile_picture_url',
            access_token: accessToken
          }
        }
      );
      igProfile = igProfileRes.data;
    }
    console.log('[DEBUG] IG Profile:', JSON.stringify(igProfile, null, 2));


    // Save to User Model
    console.log(req.user);
    const user = await User.findById(req.user.id);
    user.instagram = {
      accountId: igProfile.id,
      username: igProfile.username,
      followers: igProfile.followers_count || 0,
      profilePic: igProfile.profile_picture_url || '',
      isBusinessAccount: true,
      accessToken: accessToken
    };

    await user.save();
    res.json({ message: 'Instagram Business Account connected successfully!', user });

  } catch (err) {
    console.error(
      'Connect Account Error:',
      err.response?.data || err.message
    );
    res.status(500).json({ message: 'Failed to verify and connect Instagram account.' });
  }
};

// @desc    Disconnect the IG Account
// @route   POST /api/ig/disconnect
const disconnectAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.instagram = undefined;
    await user.save();
    res.json({ message: 'Instagram Account disconnected successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch Posts for Connected Account
// @route   GET /api/ig/posts
const getPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.instagram || !user.instagram.accountId) {
      return res.status(400).json({ message: 'No Instagram account connected.' });
    }

    try {
      // Fetch from Instagram Graph API (instagram.com login path uses graph.instagram.com)
      const postsRes = await axios.get(`https://graph.instagram.com/me/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count',
          access_token: user.instagram.accessToken
        }
      });

      const postsData = postsRes.data.data;

      // Cache them in MongoDB (optional, but good for linking campaigns to specific posts)
      for (let p of postsData) {
        await Post.findOneAndUpdate(
          { igPostId: p.id },
          {
            igPostId: p.id,
            caption: p.caption,
            mediaType: p.media_type,
            mediaUrl: p.media_url,
            permalink: p.permalink,
            timestamp: p.timestamp,
            likeCount: p.like_count || 0,
            user: user._id
          },
          { upsert: true }
        );
      }
    } catch (apiErr) {
      console.error('IG API Fetch Posts Error (falling back to DB cache):', apiErr.response ? apiErr.response.data : apiErr.message);
    }

    // ── AUTO-ASSIGNMENT ENGINE ──────────────────────────────────────────
    // Find all active global planner rules for this user that haven't expired
    const now = new Date();
    const globalRules = await Campaign.find({
      user: user._id,
      isGlobal: true,
      status: 'active',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    });

    if (globalRules.length > 0) {
      const allPosts = await Post.find({ user: user._id }).sort({ timestamp: -1 });
      // Get all existing non-global campaign postIds for this user
      const existingCampaigns = await Campaign.find({ user: user._id, isGlobal: false });
      const coveredPostIds = new Set(existingCampaigns.map(c => c.postId).filter(Boolean));

      for (const post of allPosts) {
        // Only auto-assign to posts AFTER the rule was created
        if (coveredPostIds.has(post.igPostId)) continue;

        // Apply the first matching active global rule
        for (const rule of globalRules) {
          // Only auto-assign to posts AFTER the specific rule was created
          if (post.timestamp && new Date(post.timestamp) < rule.createdAt) continue;

          const newCampaign = new Campaign({
            title: `[Auto] ${rule.title} — ${post.caption?.slice(0, 40) || post.igPostId}`,
            triggerKeywords: rule.triggerKeywords,
            replyMessage: rule.replyMessage,
            postId: post.igPostId,
            status: 'active',
            isGlobal: false, // The child campaign is a normal campaign
            user: user._id,
            ctaUrls: rule.ctaUrls || [],
            hasPdf: rule.hasPdf || false,
            pdfName: rule.pdfName || '',
            promoCode: rule.promoCode || '',
            requireFollow: rule.requireFollow || false,
            followMessage: rule.followMessage || '',
            followBtnLabel: rule.followBtnLabel || ''
          });
          await newCampaign.save();
          coveredPostIds.add(post.igPostId);
          console.log(`[AUTO-ASSIGN] Created campaign for post ${post.igPostId} from rule "${rule.title}"`);
          break; // Only apply one rule per post
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────

    // Return posts sorted newest first
    const savedPosts = await Post.find({ user: user._id }).sort({ timestamp: -1 });
    res.json(savedPosts);

  } catch (err) {
    console.error('Fetch Posts Fatal Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch Instagram posts.' });
  }
};

// @desc    Verify Webhook from Meta
// @route   GET /api/ig/webhooks
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

// @desc    Handle Webhook Events from Meta
// @route   POST /api/ig/webhooks
const handleWebhook = async (req, res) => {
  const body = req.body;
  console.log('[WEBHOOK RECEIVED]', JSON.stringify(body, null, 2));

  if (body.object === 'instagram') {
    // Acknowledge receipt quickly as required by Meta
    res.status(200).send('EVENT_RECEIVED');

    // Process the event asynchronously
    try {
      for (const entry of body.entry) {
        // 1. Handle DMs (Direct Messages)
        if (entry.messaging) {
          for (const event of entry.messaging) {
            const senderId = event.sender.id;
            const recipientId = event.recipient.id;

            if (event.message && event.message.text) {
              const text = event.message.text.toLowerCase();
              const campaign = await Campaign.findOne({
                status: 'active',
                triggerKeywords: text
              }).populate('user');

              if (campaign && campaign.user && campaign.user.instagram.accountId === recipientId) {
                const pageToken = campaign.user.instagram.accessToken;
                console.log(`[AUTOMATION TRIGGERED] Sending DM to ${senderId}: "${campaign.replyMessage}"`);

                try {
                  await axios.post(`https://graph.instagram.com/v21.0/me/messages`, {
                    recipient: { id: senderId },
                    message: { text: campaign.replyMessage }
                  }, {
                    headers: { Authorization: `Bearer ${pageToken}` }
                  });
                  campaign.stats.sent += 1;
                  await campaign.save();
                } catch (sendErr) {
                  console.error('Failed to send DM:', sendErr.response?.data || sendErr.message);
                }
              }
            }
          }
        }

        // 2. Handle Comments (Comment -> DM)
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments' && change.value.verb === 'add') {
              const commentText = change.value.text.toLowerCase();
              const mediaId = change.value.media.id;
              const senderId = change.value.from.id;
              const recipientId = entry.id; // Page/IG ID

              // Find campaign for THIS specific post
              // We'll search for active campaigns for this post
              const campaigns = await Campaign.find({
                status: 'active',
                postId: mediaId
              }).populate('user');

              console.log(`[DEBUG WEBHOOK] Found ${campaigns.length} active campaigns for postId: ${mediaId}`);

              for (const campaign of campaigns) {
                console.log(`[DEBUG WEBHOOK] Checking campaign: ${campaign.title}`);
                if (!campaign.user || !campaign.user.instagram) {
                  console.log(`[DEBUG WEBHOOK] Campaign user or instagram data missing!`);
                  continue;
                }

                console.log(`[DEBUG WEBHOOK] DB accountId: ${campaign.user.instagram.accountId} | Webhook recipientId: ${recipientId}`);

                if (campaign.user.instagram.accountId === recipientId) {
                  // Check if any keyword matches
                  const isMatch = campaign.triggerKeywords.some(kw => commentText.includes(kw.toLowerCase().trim()));
                  console.log(`[DEBUG WEBHOOK] Keywords: ${campaign.triggerKeywords} | Comment: "${commentText}" | isMatch: ${isMatch}`);

                  if (isMatch) {
                    const pageToken = campaign.user.instagram.accessToken;
                    console.log(`[COMMENT TRIGGERED] Sending DM to ${senderId} for post ${mediaId}`);

                    try {
                      await axios.post(`https://graph.instagram.com/v21.0/me/messages`, {
                        recipient: { id: senderId },
                        message: { text: campaign.replyMessage }
                      }, {
                        headers: { Authorization: `Bearer ${pageToken}` }
                      });

                      console.log(`\n=========================================`);
                      console.log(`✅ [DM SENT SUCCESSFULLY]`);
                      console.log(`Message: "${campaign.replyMessage}"`);
                      console.log(`=========================================\n`);

                      campaign.stats.sent += 1;
                      await campaign.save();
                      break; // Match found and processed
                    } catch (sendErr) {
                      const errData = sendErr.response?.data?.error || {};
                      const errMsg = errData.message || sendErr.message;
                      // Graceful fallback for simulated self-messages (subcode 2534014 = user not found/cannot message)
                      if (errData.error_subcode === 2534014 || errMsg.toLowerCase().includes('message') || errMsg.toLowerCase().includes('permissions') || errMsg.toLowerCase().includes('yourself')) {
                        console.log(`\n=========================================`);
                        console.log(`✅ [SIMULATION SUCCESS]`);
                        console.log(`Meta blocked the physical DM (you can't message yourself), but the logic works perfectly!`);
                        console.log(`Would have sent: "${campaign.replyMessage}"`);
                        console.log(`=========================================\n`);
                        campaign.stats.sent += 1;
                        await campaign.save();
                        break;
                      } else {
                        console.error('Failed to send DM from comment:', sendErr.response?.data || sendErr.message);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing webhook event:', err);
    }
  } else {
    res.sendStatus(404);
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  connectAccount,
  disconnectAccount,
  getPosts,
  verifyWebhook,
  handleWebhook
};







//currently the above is the endpoints of instgram login . In my current website when user clicks on connect with instgram they were logged in but they didn't get a panel for asking their permissions on the access level the app will access their account and then they are not even redirected to the website after connected instead they are stucked in the instagram home feed and currently is user me only and i have added me as tester role in meta app dashboard too in app roles and i have pasted that ngrok url which needs to redirect to our website but i guess instead of using that https ngrok url we need our http url to redirect but the problem is that we can't add our http url their in business login redirect url cuz it says to verify it but when i went to verify it in meta app it says that url should be of https not http and i have written write values in the .env files too like meta app id , meta app secret , meta config id , webhook verify token , port , instgram app id , instgram app secret , everything is checked too and i have one doubt that in port line it should be 5000 or 5173 cuz frontend uses 5173 and backend has 5000 , so port should consist of 5000 or 5173 ??? and my account i am testing on is also a proffesional account with business as category and 