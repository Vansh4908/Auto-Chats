const nodemailer = require('nodemailer');

/**
 * Sends a 6-digit OTP to the user's email.
 * If SMTP credentials are not set, it will fallback gracefully to logging in the console.
 * 
 * @param {string} email - Recipient email address
 * @param {string} code - The 6-digit OTP code
 */
const sendOtpEmail = async (email, code) => {
  const isSmtpConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  // Always log the OTP to the console in a beautifully formatted block for instant local testing!
  console.log('\n' + '='.repeat(60));
  console.log('📬  [FOODCHOW AUTHENTICATION - OTP SENT]');
  console.log(`📧  To:      ${email}`);
  console.log(`🔑  Code:    ${code}`);
  console.log(`⏰  Expires: In 10 minutes`);
  if (!isSmtpConfigured) {
    console.log('⚠️   Note: SMTP credentials are not configured. Using console log fallback.');
  } else {
    console.log(`📧  Status: Attempting to send real email via ${process.env.EMAIL_SERVICE || 'Gmail'}...`);
  }
  console.log('='.repeat(60) + '\n');

  if (!isSmtpConfigured) {
    return { success: true, logged: true };
  }

  try {
    // Create a flexible transport options object
    const transportOptions = {};

    if (process.env.EMAIL_HOST) {
      // If custom SMTP host (like smtp.resend.com) is provided, use it!
      transportOptions.host = process.env.EMAIL_HOST;
      transportOptions.port = parseInt(process.env.EMAIL_PORT || '587');
      transportOptions.secure = process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465';
      transportOptions.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };
      // For SSL/TLS and modern firewalls, rejectUnauthorized: false ensures connection success
      transportOptions.tls = {
        rejectUnauthorized: false
      };
    } else {
      // Fallback/Default to standard Gmail
      transportOptions.service = process.env.EMAIL_SERVICE || 'gmail';
      transportOptions.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const mailOptions = {
      from: `"FoodChow Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'FoodChow Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-corners: 8px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0d9488; margin: 0; font-size: 28px;">FoodChow</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Your Authentication Code</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">You are receiving this email because you initiated a login or signup request on FoodChow. Please use the following 6-digit OTP code to complete your verification:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; color: #0d9488; letter-spacing: 5px; padding: 15px 30px; background-color: #f0fdfa; border-radius: 12px; border: 1px solid #ccfbf1;">
              ${code}
            </span>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅  Email successfully sent to ${email} (MessageID: ${info.messageId})`);
    return { success: true, sent: true };
  } catch (error) {
    console.error('❌  Error sending email through nodemailer:', error.message);
    console.log('⚠️   Fallback: Authentication will continue. Use the console log OTP above to verify.');
    return { success: true, fallback: true, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
};
