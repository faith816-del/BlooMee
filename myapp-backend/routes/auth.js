const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const passport = require('passport'); // ✅ Added for Google OAuth
require('dotenv').config();

// ===== Signup Route =====
router.post('/signup', async (req, res) => {
  try {
    console.log("📥 Signup request received:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.log("❌ Missing field");
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists");
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed");

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    console.log("✅ User saved to database");

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log("🎟 Token generated");

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error("🔥 Error during signup:", err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ===== Login Route =====
router.post('/login', async (req, res) => {
  try {
    console.log("📥 Login request received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ User not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("🚫 Wrong password");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // increment coins on successful login
    user.coins = (user.coins || 0) + 1;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log("🎟 Token generated for login");

    return res.json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, coins: user.coins, address: user.address },
    });
  } catch (err) {
    console.error("🔥 Error during login:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ===== Protected Route Example =====
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.email}! You accessed a protected route.`,
  });
});


// ===== Google OAuth Routes =====

// ✅ 1. Start Google login flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ✅ 2. Google redirects here after user grants permission
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Increment coins for OAuth login
    if (req.user) {
      req.user.coins = (req.user.coins || 0) + 1;
      req.user.save().catch(() => {});
    }

    // Generate JWT for logged-in user
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    res.redirect(`${frontendUrl}/profile.html?token=${token}&name=${encodeURIComponent(req.user.name)}`);
  }
);

// ✅ 3. Failure route
router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: 'Google login failed' });
});

// ===== Get Logged-In User Info =====
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email coins address');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error("🔥 Error fetching user profile:", err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// ===== Update Address =====
router.put('/address', authMiddleware, async (req, res) => {
  try {
    const { city, country, street, postalCode } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = {
      city: city || user.address?.city || '',
      country: country || user.address?.country || '',
      street: street || user.address?.street || '',
      postalCode: postalCode || user.address?.postalCode || ''
    };
    await user.save();

    res.json({ message: 'Address updated', address: user.address });
  } catch (err) {
    console.error('🔥 Error updating address:', err);
    res.status(500).json({ message: 'Server error updating address' });
  }
});

module.exports = router;