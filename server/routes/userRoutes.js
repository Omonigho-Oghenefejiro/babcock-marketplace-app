const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiryDate,
  pruneRefreshTokens,
} = require('../utils/authTokens');

const router = express.Router();

const issueAuthTokens = async (user, rotatingTokenHash = null) => {
  const accessToken = createAccessToken({ userId: user._id, role: user.role });
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const existingRefreshTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
  const withoutRotatedToken = rotatingTokenHash
    ? existingRefreshTokens.filter((entry) => entry.tokenHash !== rotatingTokenHash)
    : existingRefreshTokens;

  const merged = [
    ...withoutRotatedToken,
    {
      tokenHash: refreshTokenHash,
      expiresAt: getRefreshTokenExpiryDate(),
      createdAt: new Date(),
    },
  ];

  user.refreshTokens = pruneRefreshTokens(merged);
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

const toAuthUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      fullName,
      email,
      password,
      phone,
    });

    await user.save();

    const { accessToken, refreshToken } = await issueAuthTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      refreshToken,
      user: toAuthUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: toAuthUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rotate refresh token and issue a new access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ 'refreshTokens.tokenHash': refreshTokenHash });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenEntry = user.refreshTokens.find((entry) => entry.tokenHash === refreshTokenHash);
    if (!tokenEntry || new Date(tokenEntry.expiresAt).getTime() <= Date.now()) {
      user.refreshTokens = pruneRefreshTokens(
        user.refreshTokens.filter((entry) => entry.tokenHash !== refreshTokenHash)
      );
      await user.save();
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const { accessToken, refreshToken: nextRefreshToken } = await issueAuthTokens(user, refreshTokenHash);

    return res.json({
      message: 'Token refreshed',
      token: accessToken,
      refreshToken: nextRefreshToken,
      user: toAuthUserPayload(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Logout current session by revoking the current refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ 'refreshTokens.tokenHash': refreshTokenHash });

    if (!user) {
      return res.json({ message: 'Logged out' });
    }

    user.refreshTokens = user.refreshTokens.filter((entry) => entry.tokenHash !== refreshTokenHash);
    await user.save();

    return res.json({ message: 'Logged out' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/profile', auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('wishlist')
      .populate('cart.productId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/profile', auth, adminCheck, async (req, res) => {
  try {
    const { fullName, phone, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, phone, profileImage },
      { new: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wishlist
router.get('/wishlist', auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle wishlist product
router.post('/wishlist/toggle', auth, adminCheck, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const exists = user.wishlist.some((item) => item.toString() === productId);
    if (exists) {
      user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    await user.populate('wishlist');

    res.json({
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
