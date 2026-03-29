const express = require('express');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail } = require('../utils/notificationService');
const { isGoogleAuthConfigured } = require('../utils/googleAuth');
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiryDate,
  pruneRefreshTokens,
} = require('../utils/authTokens');

const router = express.Router();
const frontendRedirectBase = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
const backendPublicBase = String(process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

const buildFrontendLoginRedirect = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return `${frontendRedirectBase}/#/login${search ? `?${search}` : ''}`;
};

const consumeEmailVerification = async (user) => {
  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
};

const issueAndSendVerificationChallenge = async (user) => {
  const verificationCode = String(crypto.randomInt(100000, 1000000));
  const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

  user.emailVerificationCode = verificationCode;
  user.emailVerificationExpires = verificationExpiresAt;
  await user.save();

  const verificationLink = buildVerificationLink(user.email, verificationCode);

  // Send email asynchronously (non-blocking) to prevent timeout from blocking registration
  sendEmail({
    to: user.email,
    subject: 'Verify your Babcock Marketplace account',
    text: `Your verification code is: ${verificationCode}\n\nEnter this code in the app to verify your email. The code expires in 10 minutes.`,
  }).catch((error) => {
    // Log email failure but don't crash the request
    console.error('Verification email failed to send', { email: user.email, error: error.message });
  });
};

const isBabcockEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized.includes('@')) {
    return false;
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart || !domainPart.includes('.')) {
    return false;
  }

  return domainPart.includes('babcock.edu.ng');
};

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
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  campusRole: user.campusRole,
  role: user.role,
  isVerified: user.isVerified,
  profileImage: user.profileImage,
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, campusRole, profileImage, username } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!isBabcockEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a valid Babcock email address.' });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      }

      await issueAndSendVerificationChallenge(user);
      return res.status(202).json({
        message: 'Account already exists but is not verified. Verification email resent.',
        requiresVerification: true,
      });
    }

    const usernameBase = String(username || normalizedEmail.split('@')[0] || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 24);
    let normalizedUsername = usernameBase || undefined;

    if (normalizedUsername) {
      let suffix = 0;
      while (await User.findOne({ username: normalizedUsername })) {
        suffix += 1;
        const suffixText = String(suffix);
        const base = usernameBase.slice(0, Math.max(1, 24 - suffixText.length));
        normalizedUsername = `${base}${suffixText}`;
      }
    }

    user = new User({
      fullName,
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      phone,
      profileImage,
      campusRole,
      isVerified: false,
    });

    await issueAndSendVerificationChallenge(user);

    res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      requiresVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isBabcockEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a valid Babcock email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please sign in.' });
    }

    await issueAndSendVerificationChallenge(user);

    return res.json({ message: 'Verification email resent. Check your inbox.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get('/verify-email-link', async (req, res) => {
  try {
    const normalizedEmail = String(req.query.email || '').trim().toLowerCase();
    const normalizedCode = String(req.query.code || '').trim();

    if (!normalizedEmail || !normalizedCode) {
      return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=invalid`);
    }

    const now = new Date();
    const verifiedUser = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
        isVerified: false,
        emailVerificationCode: normalizedCode,
        emailVerificationExpires: { $gt: now },
      },
      {
        $set: { isVerified: true },
        $unset: { emailVerificationCode: 1, emailVerificationExpires: 1 },
      },
      { new: true }
    );

    if (verifiedUser) {
      return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=success`);
    }

    const user = await User.findOne({ email: normalizedEmail }).select('isVerified emailVerificationExpires');
    if (!user) {
      return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=invalid`);
    }
    if (user.isVerified) {
      return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=success`);
    }
    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires).getTime() <= Date.now()) {
      return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=expired`);
    }

    return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=invalid`);
  } catch (err) {
    return res.redirect(`${frontendRedirectBase}/#/verify-email?verify=failed`);
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedCode = String(code || '').trim();

    if (!normalizedEmail || !normalizedCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const now = new Date();
    const verifiedUser = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
        isVerified: false,
        emailVerificationCode: normalizedCode,
        emailVerificationExpires: { $gt: now },
      },
      {
        $set: { isVerified: true },
        $unset: { emailVerificationCode: 1, emailVerificationExpires: 1 },
      },
      { new: true }
    ).select('_id');

    if (verifiedUser) {
      return res.json({ message: 'Email verified successfully' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('isVerified emailVerificationCode emailVerificationExpires');
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }
    if (user.isVerified) {
      return res.json({ message: 'Email already verified' });
    }
    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return res.status(400).json({ message: 'No active verification code for this account' });
    }
    if (new Date(user.emailVerificationExpires).getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    return res.status(400).json({ message: 'Invalid verification code' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.json({ message: 'If an account exists, reset instructions have been sent.' });
    }

    user.resetPasswordToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    // Send email asynchronously (non-blocking)
    sendEmail({
      to: user.email,
      subject: 'Password reset request',
      text: `Use this reset token within 30 minutes: ${user.resetPasswordToken}`,
    }).catch((error) => {
      console.error('Password reset email failed', { email: user.email, error: error.message });
    });

    return res.json({ message: 'If an account exists, reset instructions have been sent.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password-direct', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = String(identifier || email || '').trim().toLowerCase();

    if (!loginId) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      await issueAndSendVerificationChallenge(user);
      return res.status(403).json({
        message: 'Email not verified. Enter the verification code sent to your email.',
        requiresVerification: true,
      });
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

    if (!user.isVerified) {
      user.refreshTokens = [];
      await user.save();
      return res.status(403).json({
        message: 'Email not verified. Please verify your account to continue.',
        requiresVerification: true,
      });
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
router.get('/profile', auth, async (req, res) => {
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
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, phone, profileImage, campusRole, username } = req.body;

    const updates = { fullName, phone, profileImage, campusRole };
    if (username) {
      const normalizedUsername = String(username).trim().toLowerCase();
      const existing = await User.findOne({ username: normalizedUsername, _id: { $ne: req.user.userId } });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.username = normalizedUsername;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wishlist
router.get('/wishlist', auth, async (req, res) => {
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
router.post('/wishlist/toggle', auth, async (req, res) => {
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

router.get('/google', (req, res, next) => {
  if (!isGoogleAuthConfigured) {
    return res.status(503).json({ message: 'Google login is not configured on this server.' });
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleAuthConfigured) {
      return res.redirect(`${frontendRedirectBase}/#/login?error=google_not_configured`);
    }

    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${frontendRedirectBase}/#/login?error=google_failed`,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;
      if (!user.isVerified) {
        await issueAndSendVerificationChallenge(user);
        return res.redirect(`${frontendRedirectBase}/#/login?error=email_verification_required`);
      }

      const { accessToken, refreshToken } = await issueAuthTokens(user);

      const params = new URLSearchParams({
        token: accessToken,
        refreshToken,
        userId: String(user._id),
      });

      return res.redirect(`${frontendRedirectBase}/#/auth/callback?${params.toString()}`);
    } catch (err) {
      return res.redirect(`${frontendRedirectBase}/#/login?error=server_error`);
    }
  }
);

module.exports = router;
