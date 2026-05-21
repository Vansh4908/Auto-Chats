const axios = require('axios');

/**
 * Sends a 6-digit OTP to the user's email using the corporate FoodChow SendOTP API.
 * If the request fails, it will fallback gracefully.
 * 
 * @param {string} email - Recipient email address
 * @param {string} code - The 6-digit OTP code
 */
const sendOtpEmail = async (email, code) => {
  // Always log the OTP to the console in a beautifully formatted block for instant local testing!
  console.log('\n' + '='.repeat(60));
  console.log('📬  [FOODCHOW AUTHENTICATION - OTP SENT]');
  console.log(`📧  To:      ${email}`);
  console.log(`🔑  Code:    ${code}`);
  console.log(`⏰  Expires: In 10 minutes`);
  console.log(`📧  Status: Attempting to send real email via corporate FoodChow API...`);
  console.log('='.repeat(60) + '\n');

  try {
    const url = `https://admin.foodchow.com/api/FoodChowWD/sendOTP_Email?email=${encodeURIComponent(email)}&otp=${code}&name=AutoDM`;
    
    const response = await axios.get(url);
    
    console.log(`✅  Email successfully sent to ${email} via FoodChow API.`);
    return { success: true, sent: true };
  } catch (error) {
    console.error('❌  Error sending email through FoodChow API:', error.message);
    console.log('⚠️   Fallback: Authentication will continue. Use the console log OTP above to verify.');
    return { success: true, fallback: true, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
};
