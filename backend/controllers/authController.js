const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Make the user an admin if they use the hardcoded admin email
    const isAdmin = email === 'vanshrohit115@admin.com';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
          role: 'admin'
        });
      }
      return res.json({
        _id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: 'admin',
        token: generateToken(adminUser._id, 'admin'),
        instagramConnected: true // admin doesn't need to connect
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        instagramConnected: !!user.instagram?.accountId
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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
  getMe,
  updateProfile
};
