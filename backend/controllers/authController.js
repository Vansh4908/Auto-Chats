const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user & Send OTP
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    
    // If user exists and is already verified, block registration
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = email === 'vanshrohit115@admin.com';
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    let user;

    if (userExists) {
      // User exists but is not verified: update details and send new OTP
      userExists.firstName = firstName;
      userExists.lastName = lastName;
      userExists.password = hashedPassword;
      userExists.role = isAdmin ? 'admin' : 'user';
      userExists.otpCode = otpCode;
      userExists.otpExpires = otpExpires;
      user = await userExists.save();
    } else {
      // Create new unverified user
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: isAdmin ? 'admin' : 'user',
        isVerified: false,
        otpCode,
        otpExpires
      });
    }

    if (user) {
      // Send OTP (logs to console or sends real email)
      await sendOtpEmail(user.email, otpCode);

      res.status(200).json({
        otpRequired: true,
        email: user.email,
        message: 'Verification OTP sent to your email.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & Send OTP
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Hardcode admin check
    if (email === 'vanshrohit115@admin.com' && password === 'Vansh@1154') {
      let adminUser = await User.findOne({ email });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        adminUser = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email,
          password: hashedPassword,
          role: 'admin',
          isVerified: true
        });
      }

      // Admin requires OTP login too as requested
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      adminUser.otpCode = otpCode;
      adminUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await adminUser.save();

      await sendOtpEmail(adminUser.email, otpCode);

      return res.json({
        otpRequired: true,
        email: adminUser.email,
        message: 'Verification OTP sent to your email.'
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate OTP and save to DB
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send the OTP email
      await sendOtpEmail(user.email, otpCode);

      res.json({
        otpRequired: true,
        email: user.email,
        message: 'Verification OTP sent to your email.'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and log user in
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (!user.otpCode || user.otpCode !== otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // OTP is valid!
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
      instagramConnected: !!user.instagram?.accountId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate fresh OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otpCode);

    res.status(200).json({ message: 'Verification OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.notifs !== undefined) user.notifs = req.body.notifs;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      notifs: updatedUser.notifs,
      role: updatedUser.role,
      instagram: updatedUser.instagram
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  updateProfile
};
